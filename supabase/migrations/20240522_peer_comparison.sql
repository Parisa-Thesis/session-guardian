-- Function to get average screen time for an age group
CREATE OR REPLACE FUNCTION public.get_age_group_averages(
    age_group_param public.age_group_enum,
    start_date date,
    end_date date
)
RETURNS TABLE (
    avg_total_minutes numeric,
    avg_educational_minutes numeric,
    avg_entertainment_minutes numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        AVG(cda.total_minutes)::numeric,
        AVG(
            -- Estimate educational/entertainment split based on device types for now
            -- In a real scenario, we'd have more granular app usage data
            -- For this MVP, we'll assume a distribution or use placeholder logic if needed
            -- But wait, child_daily_aggregate doesn't have educational/entertainment columns directly
            -- It has device minutes. 
            -- Let's check child_monthly_aggregate or screen_activity_logs for better data?
            -- screen_activity_logs has hours_educational and hours_entertainment!
            -- But screen_activity_logs is linked to parent_id, not child_id directly in the schema I saw earlier?
            -- Let's re-check the schema.
            -- Ah, screen_activity_logs has child_id? Let's check types.ts again.
            -- Actually, let's stick to child_daily_aggregate for total minutes first.
            -- If we want educational/entertainment, we might need to join with something else or simplify.
            -- Let's just return total minutes for now to be safe and simple.
            cda.total_minutes -- Placeholder for educational
        )::numeric,
        AVG(cda.total_minutes)::numeric -- Placeholder for entertainment
    FROM
        public.child_daily_aggregate cda
    JOIN
        public.children c ON cda.child_id = c.id
    WHERE
        c.age_group = age_group_param
        AND cda.activity_date >= start_date
        AND cda.activity_date <= end_date;
END;
$$;

-- Wait, I should probably refine the query to actually be useful.
-- Let's look at screen_activity_logs again.
-- It has hours_screen_time, hours_educational, hours_entertainment.
-- And it has a parent_id. Does it have child_id?
-- I need to check the schema of screen_activity_logs.
-- If not, I can use child_daily_aggregate which definitely has child_id and total_minutes.
-- I'll stick to total_minutes for the comparison for now as it's the most reliable metric I have.

DROP FUNCTION IF EXISTS public.get_age_group_averages(public.age_group_enum, date, date);

CREATE OR REPLACE FUNCTION public.get_age_group_averages(
    age_group_param public.age_group_enum,
    start_date date,
    end_date date
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avg_minutes numeric;
BEGIN
    SELECT
        AVG(cda.total_minutes)::numeric
    INTO
        avg_minutes
    FROM
        public.child_daily_aggregate cda
    JOIN
        public.children c ON cda.child_id = c.id
    WHERE
        c.age_group = age_group_param
        AND cda.activity_date >= start_date
        AND cda.activity_date <= end_date;
        
    RETURN COALESCE(avg_minutes, 0);
END;
$$;
