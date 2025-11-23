-- Step 1: Just add columns and functions, NO updates yet

-- Add display_id columns to children and devices tables
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

-- Function to generate child display ID
CREATE OR REPLACE FUNCTION generate_child_display_id(child_name TEXT, child_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  name_prefix TEXT;
  short_code TEXT;
BEGIN
  -- Take first 3 letters of name, uppercase
  name_prefix := UPPER(LEFT(REGEXP_REPLACE(child_name, '[^a-zA-Z]', '', 'g'), 3));
  
  -- Take last 4 characters of UUID
  short_code := UPPER(RIGHT(REPLACE(child_uuid::TEXT, '-', ''), 4));
  
  RETURN 'CHILD-' || name_prefix || '-' || short_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate device display ID
CREATE OR REPLACE FUNCTION generate_device_display_id(device_type TEXT, child_name TEXT, device_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  type_prefix TEXT;
  name_prefix TEXT;
  short_code TEXT;
BEGIN
  -- Device type prefix mapping
  type_prefix := CASE 
    WHEN device_type ILIKE '%Tablet%' OR device_type ILIKE '%iPad%' THEN 'TAB'
    WHEN device_type ILIKE '%Phone%' OR device_type ILIKE '%iPhone%' THEN 'PHN'
    WHEN device_type ILIKE '%Laptop%' OR device_type ILIKE '%MacBook%' THEN 'LAP'
    WHEN device_type ILIKE '%Desktop%' OR device_type ILIKE '%iMac%' OR device_type ILIKE '%PC%' THEN 'DSK'
    WHEN device_type ILIKE '%TV%' THEN 'TV'
    WHEN device_type ILIKE '%Game%' OR device_type ILIKE '%Console%' OR device_type ILIKE '%PlayStation%' OR device_type ILIKE '%Xbox%' OR device_type ILIKE '%Switch%' THEN 'GME'
    ELSE 'DEV'
  END;
  
  -- Take first 3 letters of child name, uppercase
  name_prefix := UPPER(LEFT(REGEXP_REPLACE(child_name, '[^a-zA-Z]', '', 'g'), 3));
  
  -- Take last 4 characters of UUID
  short_code := UPPER(RIGHT(REPLACE(device_uuid::TEXT, '-', ''), 4));
  
  RETURN type_prefix || '-' || name_prefix || '-' || short_code;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS before_insert_child_display_id ON public.children;
DROP TRIGGER IF EXISTS before_insert_device_display_id ON public.devices;

-- Trigger to auto-generate display_id for new children
CREATE OR REPLACE FUNCTION set_child_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := generate_child_display_id(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_child_display_id
BEFORE INSERT ON public.children
FOR EACH ROW
EXECUTE FUNCTION set_child_display_id();

-- Trigger to auto-generate display_id for new devices
CREATE OR REPLACE FUNCTION set_device_display_id()
RETURNS TRIGGER AS $$
DECLARE
  child_name TEXT;
BEGIN
  IF NEW.display_id IS NULL THEN
    SELECT name INTO child_name FROM public.children WHERE id = NEW.child_id;
    NEW.display_id := generate_device_display_id(NEW.device_type, child_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_device_display_id
BEFORE INSERT ON public.devices
FOR EACH ROW
EXECUTE FUNCTION set_device_display_id();