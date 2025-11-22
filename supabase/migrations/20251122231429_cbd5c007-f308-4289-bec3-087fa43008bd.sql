-- Add RLS policies for screen_activity_logs table
-- Parents can view their own activity logs
CREATE POLICY "Parents can view own activity logs"
ON public.screen_activity_logs
FOR SELECT
USING (parent_id = auth.uid());

-- Parents can create activity logs for their children
CREATE POLICY "Parents can create activity logs"
ON public.screen_activity_logs
FOR INSERT
WITH CHECK (parent_id = auth.uid());

-- Parents can update their own activity logs
CREATE POLICY "Parents can update own activity logs"
ON public.screen_activity_logs
FOR UPDATE
USING (parent_id = auth.uid());

-- Parents can delete their own activity logs
CREATE POLICY "Parents can delete own activity logs"
ON public.screen_activity_logs
FOR DELETE
USING (parent_id = auth.uid());

-- Researchers can view activity logs with consent
CREATE POLICY "Researchers can view activity logs with consent"
ON public.screen_activity_logs
FOR SELECT
USING (
  get_user_role(auth.uid()) = 'researcher'
  AND EXISTS (
    SELECT 1 FROM public.consents
    WHERE consents.child_id = screen_activity_logs.child_id
    AND consents.granted = true
  )
);