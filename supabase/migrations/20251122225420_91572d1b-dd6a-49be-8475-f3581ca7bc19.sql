-- Update researchers table
ALTER TABLE public.researchers
  DROP COLUMN IF EXISTS institution,
  DROP COLUMN IF EXISTS research_area,
  ADD COLUMN IF NOT EXISTS profile_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Remove default
ALTER TABLE public.researchers ALTER COLUMN profile_id DROP DEFAULT;

-- Update screen_activity_analysis table
ALTER TABLE public.screen_activity_analysis
  DROP COLUMN IF EXISTS child_id,
  DROP COLUMN IF EXISTS analysis_date,
  DROP COLUMN IF EXISTS total_screen_time,
  DROP COLUMN IF EXISTS peak_usage_hour,
  DROP COLUMN IF EXISTS most_used_app,
  DROP COLUMN IF EXISTS analysis_data,
  ADD COLUMN IF NOT EXISTS log_id UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS researcher_id UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS risk_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flagged_behaviours TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Remove defaults
ALTER TABLE public.screen_activity_analysis 
  ALTER COLUMN log_id DROP DEFAULT,
  ALTER COLUMN researcher_id DROP DEFAULT,
  ALTER COLUMN risk_score DROP DEFAULT;

-- Update screen_activity_logs table
ALTER TABLE public.screen_activity_logs
  DROP COLUMN IF EXISTS device_id,
  DROP COLUMN IF EXISTS session_id,
  DROP COLUMN IF EXISTS timestamp,
  DROP COLUMN IF EXISTS app_name,
  DROP COLUMN IF EXISTS activity_type,
  DROP COLUMN IF EXISTS duration_minutes,
  ADD COLUMN IF NOT EXISTS parent_id UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS hours_screen_time INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours_educational INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours_entertainment INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS device_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Remove defaults
ALTER TABLE public.screen_activity_logs 
  ALTER COLUMN parent_id DROP DEFAULT,
  ALTER COLUMN activity_date DROP DEFAULT,
  ALTER COLUMN hours_screen_time DROP DEFAULT,
  ALTER COLUMN hours_educational DROP DEFAULT,
  ALTER COLUMN hours_entertainment DROP DEFAULT,
  ALTER COLUMN device_type DROP DEFAULT;

-- Update screen_sessions table
ALTER TABLE public.screen_sessions
  DROP COLUMN IF EXISTS status;