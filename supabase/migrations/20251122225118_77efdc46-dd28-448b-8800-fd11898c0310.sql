-- Create age_group enum
CREATE TYPE public.age_group_enum AS ENUM ('0-2', '3-5', '6-8', '9-11', '12-14', '15-17', '18+');

-- Drop policies that depend on consent_given
DROP POLICY IF EXISTS "Researchers can view children with consent" ON public.children;
DROP POLICY IF EXISTS "Researchers can view daily aggregate with consent" ON public.child_daily_aggregate;

-- Update children table
ALTER TABLE public.children 
  DROP COLUMN IF EXISTS age,
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS updated_at,
  ADD COLUMN IF NOT EXISTS anonymous_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS age_group age_group_enum;

-- Update consents table
ALTER TABLE public.consents
  DROP COLUMN IF EXISTS consent_given,
  DROP COLUMN IF EXISTS consent_type,
  DROP COLUMN IF EXISTS consent_date,
  ADD COLUMN IF NOT EXISTS researcher_id UUID NOT NULL,
  ADD COLUMN IF NOT EXISTS granted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE;

-- Update device_catalog table
ALTER TABLE public.device_catalog
  DROP COLUMN IF EXISTS model,
  DROP COLUMN IF EXISTS manufacturer,
  ADD COLUMN IF NOT EXISTS device_name TEXT NOT NULL DEFAULT '';

-- Remove the default after adding the column
ALTER TABLE public.device_catalog ALTER COLUMN device_name DROP DEFAULT;
ALTER TABLE public.children ALTER COLUMN anonymous_id DROP DEFAULT;

-- Recreate policies with new column name
CREATE POLICY "Researchers can view children with consent" 
ON public.children
FOR SELECT
USING (
  (get_user_role(auth.uid()) = 'researcher'::user_role) AND 
  (EXISTS (
    SELECT 1
    FROM consents
    WHERE (consents.child_id = children.id) AND (consents.granted = true)
  ))
);

CREATE POLICY "Researchers can view daily aggregate with consent" 
ON public.child_daily_aggregate
FOR SELECT
USING (
  (get_user_role(auth.uid()) = 'researcher'::user_role) AND 
  (EXISTS (
    SELECT 1
    FROM consents
    WHERE (consents.child_id = child_daily_aggregate.child_id) AND (consents.granted = true)
  ))
);