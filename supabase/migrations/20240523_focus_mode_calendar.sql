-- Add focus_mode_until to parental_controls
ALTER TABLE public.parental_controls ADD COLUMN IF NOT EXISTS focus_mode_until TIMESTAMP WITH TIME ZONE;

-- Create weekly_schedules table
CREATE TABLE IF NOT EXISTS public.weekly_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    label TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for weekly_schedules
CREATE POLICY "Parents can manage schedules for their children"
    ON public.weekly_schedules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = weekly_schedules.child_id
            AND children.parent_id = auth.uid()
        )
    );
