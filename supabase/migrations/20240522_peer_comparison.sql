-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.get_age_group_averages(public.age_group_enum, date, date);

-- Create the get_age_group_averages function
-- This function calculates the average daily screen time for children in a specific age group
-- within a given date range. Returns average total minutes as a single numeric value.
CREATE OR REPLACE FUNCTION public.get_age_group_averages(
    age_group_param public.age_group_enum,
    start_date date,
    end_date date
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    avg_minutes numeric;
BEGIN
    -- Calculate average total_minutes from child_daily_aggregate
    -- for children in the specified age group within the date range
    SELECT
        AVG(cda.total_minutes)::numeric
    INTO
        avg_minutes
    FROM
        public.child_daily_aggregate cda
    INNER JOIN
        public.children c ON cda.child_id = c.id
    WHERE
        c.age_group = age_group_param
        AND cda.activity_date >= start_date
        AND cda.activity_date <= end_date;
    
    -- Return 0 if no data found (COALESCE handles NULL)
    RETURN COALESCE(avg_minutes, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_age_group_averages(public.age_group_enum, date, date) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_age_group_averages IS 'Calculates average daily screen time in minutes for a specific age group within a date range. Returns a single numeric value representing average total minutes per day.';

