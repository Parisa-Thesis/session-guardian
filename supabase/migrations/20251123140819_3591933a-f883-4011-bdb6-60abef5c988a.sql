-- Allow researchers to see children for consent requests
CREATE POLICY "Researchers can view children for consent"
ON public.children
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'researcher');

-- Extend consents table with data scope and purpose
ALTER TABLE public.consents
  ADD COLUMN IF NOT EXISTS data_scope_summary boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_scope_activity_logs boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_scope_sessions boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_scope_location boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_scope_devices boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS research_purpose text;