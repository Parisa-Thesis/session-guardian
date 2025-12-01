-- Allow researchers to view weekly reports if they have an approved consent request for the parent
CREATE POLICY "Researchers can view reports with consent"
    ON public.weekly_reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.consent_requests
            WHERE consent_requests.parent_id = weekly_reports.user_id
            AND consent_requests.researcher_id = auth.uid()
            AND consent_requests.status = 'approved'
        )
    );
