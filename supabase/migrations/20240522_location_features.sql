-- Create safe_zones table
CREATE TABLE IF NOT EXISTS public.safe_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create location_history table
CREATE TABLE IF NOT EXISTS public.location_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy_meters DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_safe_zone BOOLEAN DEFAULT FALSE,
    safe_zone_id UUID REFERENCES public.safe_zones(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- Policies for safe_zones
CREATE POLICY "Parents can manage their children's safe zones"
    ON public.safe_zones
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE public.children.id = safe_zones.child_id
            AND public.children.parent_id = auth.uid()
        )
    );

-- Policies for location_history
CREATE POLICY "Parents can view their children's location history"
    ON public.location_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE public.children.id = location_history.child_id
            AND public.children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Researchers can view location history if consented"
    ON public.location_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.consents
            WHERE public.consents.child_id = location_history.child_id
            AND public.consents.researcher_id = auth.uid()
            AND public.consents.granted = TRUE
            AND public.consents.data_scope_location = TRUE
        )
    );
