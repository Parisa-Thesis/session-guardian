-- Drop policies that depend on columns being removed
DROP POLICY IF EXISTS "Parents can manage parental checks" ON public.parental_checks;
DROP POLICY IF EXISTS "Parents can manage children's devices" ON public.devices;
DROP POLICY IF EXISTS "Parents can view children's devices" ON public.devices;
DROP POLICY IF EXISTS "Researchers can create logs" ON public.research_logs;
DROP POLICY IF EXISTS "Researchers can view own logs" ON public.research_logs;

-- Update devices table
ALTER TABLE public.devices
  DROP COLUMN IF EXISTS device_catalog_id,
  DROP COLUMN IF EXISTS device_identifier,
  DROP COLUMN IF EXISTS device_name,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS last_active,
  DROP COLUMN IF EXISTS updated_at,
  ADD COLUMN IF NOT EXISTS device_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS os TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT;

-- Remove default after adding the column
ALTER TABLE public.devices ALTER COLUMN device_type DROP DEFAULT;

-- Update parental_checks table
ALTER TABLE public.parental_checks
  DROP COLUMN IF EXISTS parent_id,
  DROP COLUMN IF EXISTS rule_type,
  DROP COLUMN IF EXISTS rule_config,
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS created_at,
  DROP COLUMN IF EXISTS updated_at,
  ADD COLUMN IF NOT EXISTS question TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS answer TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_correct BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Remove defaults
ALTER TABLE public.parental_checks 
  ALTER COLUMN question DROP DEFAULT,
  ALTER COLUMN answer DROP DEFAULT,
  ALTER COLUMN is_correct DROP DEFAULT,
  ALTER COLUMN checked_at DROP DEFAULT;

-- Update research_logs table
ALTER TABLE public.research_logs
  DROP COLUMN IF EXISTS data_accessed,
  DROP COLUMN IF EXISTS action,
  DROP COLUMN IF EXISTS timestamp,
  ADD COLUMN IF NOT EXISTS child_id UUID NOT NULL,
  ADD COLUMN IF NOT EXISTS analysis_id UUID,
  ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Remove defaults
ALTER TABLE public.research_logs 
  ALTER COLUMN action_type DROP DEFAULT,
  ALTER COLUMN created_at DROP DEFAULT;

-- Recreate policies with new structure
CREATE POLICY "Parents can view children's devices"
ON public.devices
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM children
    WHERE children.id = devices.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can manage children's devices"
ON public.devices
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM children
    WHERE children.id = devices.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can manage parental checks"
ON public.parental_checks
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM children
    WHERE children.id = parental_checks.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Researchers can create logs"
ON public.research_logs
FOR INSERT
WITH CHECK (researcher_id = auth.uid());

CREATE POLICY "Researchers can view own logs"
ON public.research_logs
FOR SELECT
USING (researcher_id = auth.uid());