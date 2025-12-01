-- Create cohorts table
CREATE TABLE IF NOT EXISTS public.cohorts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create cohort_members table
CREATE TABLE IF NOT EXISTS public.cohort_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cohort_id, child_id)
);

-- Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

-- Policies for cohorts
CREATE POLICY "Researchers can manage their own cohorts"
    ON public.cohorts
    FOR ALL
    USING (auth.uid() = researcher_id);

-- Policies for cohort_members
-- Researchers can view members of their own cohorts
CREATE POLICY "Researchers can manage members of their own cohorts"
    ON public.cohort_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cohorts
            WHERE id = public.cohort_members.cohort_id
            AND researcher_id = auth.uid()
        )
    );
