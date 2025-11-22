-- Add RLS policies for screen_activity_analysis table
-- Researchers can view all analysis
CREATE POLICY "Researchers can view analysis"
ON public.screen_activity_analysis
FOR SELECT
USING (get_user_role(auth.uid()) = 'researcher');

-- Researchers can create analysis
CREATE POLICY "Researchers can create analysis"
ON public.screen_activity_analysis
FOR INSERT
WITH CHECK (researcher_id = auth.uid());

-- Researchers can update own analysis
CREATE POLICY "Researchers can update own analysis"
ON public.screen_activity_analysis
FOR UPDATE
USING (researcher_id = auth.uid());

-- Researchers can delete own analysis
CREATE POLICY "Researchers can delete own analysis"
ON public.screen_activity_analysis
FOR DELETE
USING (researcher_id = auth.uid());