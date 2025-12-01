-- Add email_weekly_report to notification_preferences
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS email_weekly_report BOOLEAN DEFAULT FALSE;

-- Create weekly_reports table
CREATE TABLE IF NOT EXISTS public.weekly_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    summary_json JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('generated', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- Policies for weekly_reports
CREATE POLICY "Users can view their own weekly reports"
    ON public.weekly_reports
    FOR SELECT
    USING (user_id = auth.uid());
