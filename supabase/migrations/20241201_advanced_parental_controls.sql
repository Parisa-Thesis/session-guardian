-- Advanced Parental Controls Schema
-- Created: 2024-12-01

-- App Controls Table
CREATE TABLE IF NOT EXISTS app_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  app_category TEXT CHECK (app_category IN ('games', 'social', 'educational', 'entertainment', 'productivity', 'other')),
  is_blocked BOOLEAN DEFAULT false,
  daily_limit_minutes INTEGER,
  is_unlimited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, app_name)
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('bedtime', 'school', 'homework', 'custom')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
  allowed_apps TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instant Actions Table
CREATE TABLE IF NOT EXISTS instant_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('pause', 'unlock', 'grant_time')),
  duration_minutes INTEGER,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Timeline Table
CREATE TABLE IF NOT EXISTS activity_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  app_name TEXT NOT NULL,
  app_category TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_controls_child_id ON app_controls(child_id);
CREATE INDEX IF NOT EXISTS idx_schedules_child_id ON schedules(child_id);
CREATE INDEX IF NOT EXISTS idx_schedules_active ON schedules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_instant_actions_child_id ON instant_actions(child_id);
CREATE INDEX IF NOT EXISTS idx_instant_actions_active ON instant_actions(is_active, expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_activity_timeline_child_id ON activity_timeline(child_id);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_time ON activity_timeline(child_id, start_time DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_app_controls_updated_at
  BEFORE UPDATE ON app_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE app_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_timeline ENABLE ROW LEVEL SECURITY;

-- App Controls Policies
CREATE POLICY "Parents can view their children's app controls"
  ON app_controls FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage their children's app controls"
  ON app_controls FOR ALL
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Schedules Policies
CREATE POLICY "Parents can view their children's schedules"
  ON schedules FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage their children's schedules"
  ON schedules FOR ALL
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Instant Actions Policies
CREATE POLICY "Parents can view their instant actions"
  ON instant_actions FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can create instant actions"
  ON instant_actions FOR INSERT
  WITH CHECK (
    parent_id = auth.uid() AND
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Activity Timeline Policies
CREATE POLICY "Parents can view their children's activity"
  ON activity_timeline FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "System can insert activity"
  ON activity_timeline FOR INSERT
  WITH CHECK (true);

-- Helper function to get current active action for a child
CREATE OR REPLACE FUNCTION get_active_instant_action(p_child_id UUID)
RETURNS TABLE (
  action_type TEXT,
  expires_at TIMESTAMPTZ,
  duration_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ia.action_type,
    ia.expires_at,
    ia.duration_minutes
  FROM instant_actions ia
  WHERE ia.child_id = p_child_id
    AND ia.is_active = true
    AND (ia.expires_at IS NULL OR ia.expires_at > NOW())
  ORDER BY ia.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get today's screen time for a child
CREATE OR REPLACE FUNCTION get_today_screen_time(p_child_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_minutes INTEGER;
BEGIN
  SELECT COALESCE(SUM(duration_minutes), 0)
  INTO total_minutes
  FROM activity_timeline
  WHERE child_id = p_child_id
    AND start_time >= CURRENT_DATE
    AND start_time < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN total_minutes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if app is currently allowed
CREATE OR REPLACE FUNCTION is_app_allowed(
  p_child_id UUID,
  p_app_name TEXT,
  p_current_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  is_blocked BOOLEAN;
  daily_limit INTEGER;
  today_usage INTEGER;
  current_schedule RECORD;
BEGIN
  -- Check if app is blocked
  SELECT ac.is_blocked, ac.daily_limit_minutes
  INTO is_blocked, daily_limit
  FROM app_controls ac
  WHERE ac.child_id = p_child_id
    AND ac.app_name = p_app_name;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Check daily limit
  IF daily_limit IS NOT NULL THEN
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO today_usage
    FROM activity_timeline
    WHERE child_id = p_child_id
      AND app_name = p_app_name
      AND start_time >= CURRENT_DATE
      AND start_time < CURRENT_DATE + INTERVAL '1 day';
    
    IF today_usage >= daily_limit THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check active schedule
  SELECT * INTO current_schedule
  FROM schedules s
  WHERE s.child_id = p_child_id
    AND s.is_active = true
    AND EXTRACT(ISODOW FROM p_current_time) = ANY(s.days_of_week)
    AND p_current_time::TIME >= s.start_time
    AND p_current_time::TIME <= s.end_time
  LIMIT 1;
  
  IF current_schedule IS NOT NULL THEN
    -- If there's an active schedule with allowed apps, check if app is in the list
    IF array_length(current_schedule.allowed_apps, 1) > 0 THEN
      RETURN p_app_name = ANY(current_schedule.allowed_apps);
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
