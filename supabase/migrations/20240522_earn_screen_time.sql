-- Add bonus_minutes to child_daily_aggregate
ALTER TABLE public.child_daily_aggregate ADD COLUMN IF NOT EXISTS bonus_minutes INTEGER DEFAULT 0;

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reward_minutes INTEGER NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS public.task_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Add RLS policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Parents can manage their tasks"
    ON public.tasks
    FOR ALL
    USING (parent_id = auth.uid());

-- Policies for task_completions
CREATE POLICY "Parents can manage task completions for their children"
    ON public.task_completions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE public.tasks.id = task_completions.task_id
            AND public.tasks.parent_id = auth.uid()
        )
    );
