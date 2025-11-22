-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('parent', 'researcher', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role public.user_role DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create device_catalog table (list of device types/models)
CREATE TABLE public.device_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  device_type TEXT NOT NULL, -- phone, tablet, laptop, desktop, etc.
  os TEXT, -- iOS, Android, Windows, macOS, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create devices table
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  device_catalog_id UUID REFERENCES public.device_catalog(id),
  device_name TEXT NOT NULL,
  device_identifier TEXT, -- unique device ID/serial
  status TEXT DEFAULT 'offline', -- online, offline, disconnected
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create screen_sessions table
CREATE TABLE public.screen_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'active', -- active, completed, interrupted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create screen_activity_logs table (detailed activity tracking)
CREATE TABLE public.screen_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.screen_sessions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  activity_type TEXT, -- app_usage, web_browsing, video, game, etc.
  app_name TEXT,
  duration_minutes INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create screen_activity_analysis table (processed/analyzed data)
CREATE TABLE public.screen_activity_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  total_screen_time INTEGER, -- in minutes
  most_used_app TEXT,
  peak_usage_hour INTEGER,
  analysis_data JSONB, -- flexible storage for various metrics
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create child_daily_aggregate table
CREATE TABLE public.child_daily_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  tv_minutes INTEGER DEFAULT 0,
  phone_minutes INTEGER DEFAULT 0,
  tablet_minutes INTEGER DEFAULT 0,
  laptop_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(child_id, activity_date)
);

-- Create child_weekly_aggregate table
CREATE TABLE public.child_weekly_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  tv_minutes INTEGER DEFAULT 0,
  phone_minutes INTEGER DEFAULT 0,
  tablet_minutes INTEGER DEFAULT 0,
  laptop_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(child_id, week_start, week_end)
);

-- Create child_monthly_aggregate table
CREATE TABLE public.child_monthly_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  tv_minutes INTEGER DEFAULT 0,
  phone_minutes INTEGER DEFAULT 0,
  tablet_minutes INTEGER DEFAULT 0,
  laptop_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(child_id, year, month)
);

-- Create consents table (research participation consent)
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  consent_type TEXT, -- research, data_sharing, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create researchers table
CREATE TABLE public.researchers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT,
  research_area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create research_logs table (audit log for researcher access)
CREATE TABLE public.research_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL REFERENCES public.researchers(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- data_export, view_report, etc.
  data_accessed TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create parental_checks table (parental control rules/limits)
CREATE TABLE public.parental_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL, -- time_limit, app_block, schedule, etc.
  rule_config JSONB, -- flexible storage for rule configuration
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_activity_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_daily_aggregate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_weekly_aggregate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_monthly_aggregate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_checks ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for children table
CREATE POLICY "Parents can view own children" ON public.children
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can create children" ON public.children
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own children" ON public.children
  FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "Parents can delete own children" ON public.children
  FOR DELETE USING (parent_id = auth.uid());

CREATE POLICY "Researchers can view children with consent" ON public.children
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'researcher' AND
    EXISTS (
      SELECT 1 FROM public.consents
      WHERE consents.child_id = children.id AND consents.consent_given = TRUE
    )
  );

-- RLS Policies for device_catalog (public read, admin write)
CREATE POLICY "Anyone can view device catalog" ON public.device_catalog
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage device catalog" ON public.device_catalog
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for devices
CREATE POLICY "Parents can view children's devices" ON public.devices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = devices.child_id AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage children's devices" ON public.devices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = devices.child_id AND children.parent_id = auth.uid()
    )
  );

-- RLS Policies for screen_sessions
CREATE POLICY "Parents can view children's sessions" ON public.screen_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = screen_sessions.child_id AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "System can create sessions" ON public.screen_sessions
  FOR INSERT WITH CHECK (TRUE); -- Device apps will create sessions

-- RLS Policies for aggregate tables (daily, weekly, monthly)
CREATE POLICY "Parents can view children's daily aggregate" ON public.child_daily_aggregate
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = child_daily_aggregate.child_id AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children's weekly aggregate" ON public.child_weekly_aggregate
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = child_weekly_aggregate.child_id AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children's monthly aggregate" ON public.child_monthly_aggregate
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = child_monthly_aggregate.child_id AND children.parent_id = auth.uid()
    )
  );

-- Researchers can view anonymized aggregates with consent
CREATE POLICY "Researchers can view daily aggregate with consent" ON public.child_daily_aggregate
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'researcher' AND
    EXISTS (
      SELECT 1 FROM public.consents
      WHERE consents.child_id = child_daily_aggregate.child_id AND consents.consent_given = TRUE
    )
  );

-- RLS Policies for consents
CREATE POLICY "Parents can manage consents" ON public.consents
  FOR ALL USING (parent_id = auth.uid());

-- RLS Policies for researchers table
CREATE POLICY "Researchers can view own profile" ON public.researchers
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all researchers" ON public.researchers
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for research_logs
CREATE POLICY "Researchers can view own logs" ON public.research_logs
  FOR SELECT USING (researcher_id = auth.uid());

CREATE POLICY "Researchers can create logs" ON public.research_logs
  FOR INSERT WITH CHECK (researcher_id = auth.uid());

-- RLS Policies for parental_checks
CREATE POLICY "Parents can manage parental checks" ON public.parental_checks
  FOR ALL USING (parent_id = auth.uid());

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parental_checks_updated_at
  BEFORE UPDATE ON public.parental_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_children_parent_id ON public.children(parent_id);
CREATE INDEX idx_devices_child_id ON public.devices(child_id);
CREATE INDEX idx_screen_sessions_child_id ON public.screen_sessions(child_id);
CREATE INDEX idx_screen_sessions_device_id ON public.screen_sessions(device_id);
CREATE INDEX idx_daily_aggregate_child_date ON public.child_daily_aggregate(child_id, activity_date);
CREATE INDEX idx_weekly_aggregate_child_dates ON public.child_weekly_aggregate(child_id, week_start, week_end);
CREATE INDEX idx_monthly_aggregate_child_year_month ON public.child_monthly_aggregate(child_id, year, month);
CREATE INDEX idx_consents_child_id ON public.consents(child_id);