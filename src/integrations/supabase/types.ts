[?25l[?2004h


  > 1. sxtedlrqcmuitlexniaw[name: session - guardian, org: pwjozlsllknbxkrhnrdd, region: eu - west - 3]
                                                                                                   
                                                                                                   
    ↑/k up • ↓/j down • / filter • q quit • ? more                                                 
                                                                                                   
[6A [J
[2K
[?2004l[?25h[?1002l[?1003l[?1006lexport type Json =
  | string
        | number
        | boolean
        | null
        | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
          // Allows to automatically instantiate createClient with right options
          // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
          __InternalSupabase: {
            PostgrestVersion: "13.0.5"
          }
          public: {
            Tables: {
              child_daily_aggregate: {
                Row: {
                  activity_date: string
                  bonus_minutes: number | null
                  child_id: string
                  created_at: string
                  id: string
                  laptop_minutes: number | null
                  phone_minutes: number | null
                  tablet_minutes: number | null
                  total_minutes: number
                  tv_minutes: number | null
                }
                Insert: {
                  activity_date: string
                  bonus_minutes?: number | null
                  child_id: string
                  created_at?: string
                  id?: string
                  laptop_minutes?: number | null
                  phone_minutes?: number | null
                  tablet_minutes?: number | null
                  total_minutes?: number
                  tv_minutes?: number | null
                }
                Update: {
                  activity_date?: string
                  bonus_minutes?: number | null
                  child_id?: string
                  created_at?: string
                  id?: string
                  laptop_minutes?: number | null
                  phone_minutes?: number | null
                  tablet_minutes?: number | null
                  total_minutes?: number
                  tv_minutes?: number | null
                }
                Relationships: [
                  {
                    foreignKeyName: "child_daily_aggregate_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              child_monthly_aggregate: {
                Row: {
                  child_id: string
                  created_at: string
                  id: string
                  laptop_minutes: number | null
                  month: number
                  phone_minutes: number | null
                  tablet_minutes: number | null
                  total_minutes: number
                  tv_minutes: number | null
                  year: number
                }
                Insert: {
                  child_id: string
                  created_at?: string
                  id?: string
                  laptop_minutes?: number | null
                  month: number
                  phone_minutes?: number | null
                  tablet_minutes?: number | null
                  total_minutes?: number
                  tv_minutes?: number | null
                  year: number
                }
                Update: {
                  child_id?: string
                  created_at?: string
                  id?: string
                  laptop_minutes?: number | null
                  month?: number
                  phone_minutes?: number | null
                  tablet_minutes?: number | null
                  total_minutes?: number
                  tv_minutes?: number | null
                  year?: number
                }
                Relationships: [
                  {
                    foreignKeyName: "child_monthly_aggregate_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              child_weekly_aggregate: {
                Row: {
                  child_id: string
                  created_at: string
                  id: string
                  laptop_minutes: number | null
                  phone_minutes: number | null
                  tablet_minutes: number | null
                  total_minutes: number
                  tv_minutes: number | null
                  week_end: string
                  week_start: string
                }
                Insert: {
                  child_id: string
                  created_at?: string
                  id?: string
                  laptop_minutes?: number | null
                  phone_minutes?: number | null
                  tablet_minutes?: number | null
                  total_minutes?: number
                  tv_minutes?: number | null
                  week_end: string
                  week_start: string
                }
                Update: {
                  child_id?: string
                  created_at?: string
                  id?: string
                  laptop_minutes?: number | null
                  phone_minutes?: number | null
                  tablet_minutes?: number | null
                  total_minutes?: number
                  tv_minutes?: number | null
                  week_end?: string
                  week_start?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "child_weekly_aggregate_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              children: {
                Row: {
                  age_group: Database["public"]["Enums"]["age_group_enum"] | null
                  anonymous_id: string
                  created_at: string
                  display_id: string | null
                  id: string
                  last_location: string | null
                  last_location_updated_at: string | null
                  name: string
                  parent_id: string
                }
                Insert: {
                  age_group?: Database["public"]["Enums"]["age_group_enum"] | null
                  anonymous_id: string
                  created_at?: string
                  display_id?: string | null
                  id?: string
                  last_location?: string | null
                  last_location_updated_at?: string | null
                  name: string
                  parent_id: string
                }
                Update: {
                  age_group?: Database["public"]["Enums"]["age_group_enum"] | null
                  anonymous_id?: string
                  created_at?: string
                  display_id?: string | null
                  id?: string
                  last_location?: string | null
                  last_location_updated_at?: string | null
                  name?: string
                  parent_id?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "children_parent_id_fkey"
                    columns: ["parent_id"]
                    isOneToOne: false
                    referencedRelation: "profiles"
                    referencedColumns: ["id"]
                  },
                ]
              }
              cohort_members: {
                Row: {
                  child_id: string
                  cohort_id: string
                  created_at: string
                  id: string
                }
                Insert: {
                  child_id: string
                  cohort_id: string
                  created_at?: string
                  id?: string
                }
                Update: {
                  child_id?: string
                  cohort_id?: string
                  created_at?: string
                  id?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "cohort_members_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                  {
                    foreignKeyName: "cohort_members_cohort_id_fkey"
                    columns: ["cohort_id"]
                    isOneToOne: false
                    referencedRelation: "cohorts"
                    referencedColumns: ["id"]
                  },
                ]
              }
              cohorts: {
                Row: {
                  created_at: string
                  description: string | null
                  id: string
                  name: string
                  researcher_id: string
                }
                Insert: {
                  created_at?: string
                  description?: string | null
                  id?: string
                  name: string
                  researcher_id: string
                }
                Update: {
                  created_at?: string
                  description?: string | null
                  id?: string
                  name?: string
                  researcher_id?: string
                }
                Relationships: []
              }
              consent_requests: {
                Row: {
                  child_id: string
                  created_at: string | null
                  id: string
                  parent_id: string
                  request_message: string | null
                  requested_at: string | null
                  researcher_id: string
                  responded_at: string | null
                  response_message: string | null
                  status: string | null
                  updated_at: string | null
                }
                Insert: {
                  child_id: string
                  created_at?: string | null
                  id: string
                  parent_id: string
                  request_message?: string | null
                  requested_at?: string | null
                  researcher_id: string
                  responded_at?: string | null
                  response_message?: string | null
                  status?: string | null
                  updated_at?: string | null
                }
                Update: {
                  child_id?: string
                  created_at?: string | null
                  id?: string
                  parent_id?: string
                  request_message?: string | null
                  requested_at?: string | null
                  researcher_id?: string
                  responded_at?: string | null
                  response_message?: string | null
                  status?: string | null
                  updated_at?: string | null
                }
                Relationships: []
              }
              consents: {
                Row: {
                  child_id: string
                  consent_date: string | null
                  consent_given: boolean
                  consent_type: string | null
                  created_at: string
                  data_scope_activity_logs: boolean
                  data_scope_devices: boolean
                  data_scope_location: boolean
                  data_scope_sessions: boolean
                  data_scope_summary: boolean
                  granted: boolean | null
                  id: string
                  parent_id: string
                  research_purpose: string | null
                  researcher_id: string | null
                }
                Insert: {
                  child_id: string
                  consent_date?: string | null
                  consent_given?: boolean
                  consent_type?: string | null
                  created_at?: string
                  data_scope_activity_logs?: boolean
                  data_scope_devices?: boolean
                  data_scope_location?: boolean
                  data_scope_sessions?: boolean
                  data_scope_summary?: boolean
                  granted?: boolean | null
                  id?: string
                  parent_id: string
                  research_purpose?: string | null
                  researcher_id?: string | null
                }
                Update: {
                  child_id?: string
                  consent_date?: string | null
                  consent_given?: boolean
                  consent_type?: string | null
                  created_at?: string
                  data_scope_activity_logs?: boolean
                  data_scope_devices?: boolean
                  data_scope_location?: boolean
                  data_scope_sessions?: boolean
                  data_scope_summary?: boolean
                  granted?: boolean | null
                  id?: string
                  parent_id?: string
                  research_purpose?: string | null
                  researcher_id?: string | null
                }
                Relationships: [
                  {
                    foreignKeyName: "consents_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                  {
                    foreignKeyName: "consents_parent_id_fkey"
                    columns: ["parent_id"]
                    isOneToOne: false
                    referencedRelation: "profiles"
                    referencedColumns: ["id"]
                  },
                  {
                    foreignKeyName: "consents_researcher_id_fkey"
                    columns: ["researcher_id"]
                    isOneToOne: false
                    referencedRelation: "profiles"
                    referencedColumns: ["id"]
                  },
                ]
              }
              device_catalog: {
                Row: {
                  created_at: string
                  device_name: string
                  device_type: string
                  id: string
                  os: string | null
                }
                Insert: {
                  created_at?: string
                  device_name: string
                  device_type: string
                  id?: string
                  os?: string | null
                }
                Update: {
                  created_at?: string
                  device_name?: string
                  device_type?: string
                  id?: string
                  os?: string | null
                }
                Relationships: []
              }
              devices: {
                Row: {
                  child_id: string
                  created_at: string
                  device_name: string | null
                  device_type: string
                  display_id: string | null
                  id: string
                  ip_address: string | null
                  last_used_at: string | null
                  model: string | null
                  os: string | null
                }
                Insert: {
                  child_id: string
                  created_at?: string
                  device_name?: string | null
                  device_type: string
                  display_id?: string | null
                  id?: string
                  ip_address?: string | null
                  last_used_at?: string | null
                  model?: string | null
                  os?: string | null
                }
                Update: {
                  child_id?: string
                  created_at?: string
                  device_name?: string | null
                  device_type?: string
                  display_id?: string | null
                  id?: string
                  ip_address?: string | null
                  last_used_at?: string | null
                  model?: string | null
                  os?: string | null
                }
                Relationships: [
                  {
                    foreignKeyName: "devices_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              notification_preferences: {
                Row: {
                  browser_enabled: boolean
                  created_at: string
                  email_weekly_report: boolean | null
                  id: string
                  notify_on_bedtime: boolean
                  notify_on_limit: boolean
                  notify_on_warning: boolean
                  updated_at: string
                  user_id: string
                }
                Insert: {
                  browser_enabled?: boolean
                  created_at?: string
                  email_weekly_report?: boolean | null
                  id?: string
                  notify_on_bedtime?: boolean
                  notify_on_limit?: boolean
                  notify_on_warning?: boolean
                  updated_at?: string
                  user_id: string
                }
                Update: {
                  browser_enabled?: boolean
                  created_at?: string
                  email_weekly_report?: boolean | null
                  id?: string
                  notify_on_bedtime?: boolean
                  notify_on_limit?: boolean
                  notify_on_warning?: boolean
                  updated_at?: string
                  user_id?: string
                }
                Relationships: []
              }
              parental_checks: {
                Row: {
                  answer: string
                  checked_at: string
                  child_id: string
                  id: string
                  is_correct: boolean
                  question: string
                }
                Insert: {
                  answer: string
                  checked_at: string
                  child_id: string
                  id?: string
                  is_correct: boolean
                  question: string
                }
                Update: {
                  answer?: string
                  checked_at?: string
                  child_id?: string
                  id?: string
                  is_correct?: boolean
                  question?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "parental_checks_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              parental_controls: {
                Row: {
                  bedtime_end: string | null
                  bedtime_start: string | null
                  child_id: string
                  created_at: string
                  daily_time_limit_minutes: number | null
                  enabled: boolean | null
                  focus_mode_until: string | null
                  id: string
                  updated_at: string
                  warning_threshold_minutes: number | null
                }
                Insert: {
                  bedtime_end?: string | null
                  bedtime_start?: string | null
                  child_id: string
                  created_at?: string
                  daily_time_limit_minutes?: number | null
                  enabled?: boolean | null
                  focus_mode_until?: string | null
                  id?: string
                  updated_at?: string
                  warning_threshold_minutes?: number | null
                }
                Update: {
                  bedtime_end?: string | null
                  bedtime_start?: string | null
                  child_id?: string
                  created_at?: string
                  daily_time_limit_minutes?: number | null
                  enabled?: boolean | null
                  focus_mode_until?: string | null
                  id?: string
                  updated_at?: string
                  warning_threshold_minutes?: number | null
                }
                Relationships: [
                  {
                    foreignKeyName: "parental_controls_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: true
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              profiles: {
                Row: {
                  created_at: string
                  email: string
                  id: string
                  name: string | null
                  role: Database["public"]["Enums"]["user_role"] | null
                }
                Insert: {
                  created_at?: string
                  email: string
                  id: string
                  name?: string | null
                  role?: Database["public"]["Enums"]["user_role"] | null
                }
                Update: {
                  created_at?: string
                  email?: string
                  id?: string
                  name?: string | null
                  role?: Database["public"]["Enums"]["user_role"] | null
                }
                Relationships: []
              }
              research_consents: {
                Row: {
                  child_id: string
                  created_at: string
                  data_scope_activity_logs: boolean
                  data_scope_devices: boolean
                  data_scope_location: boolean
                  data_scope_sessions: boolean
                  data_scope_summary: boolean
                  granted: boolean
                  granted_at: string | null
                  id: string
                  parent_id: string
                  research_purpose: string | null
                  researcher_id: string
                }
                Insert: {
                  child_id: string
                  created_at: string
                  data_scope_activity_logs: boolean
                  data_scope_devices: boolean
                  data_scope_location: boolean
                  data_scope_sessions: boolean
                  data_scope_summary: boolean
                  granted: boolean
                  granted_at?: string | null
                  id: string
                  parent_id: string
                  research_purpose?: string | null
                  researcher_id: string
                }
                Update: {
                  child_id?: string
                  created_at?: string
                  data_scope_activity_logs?: boolean
                  data_scope_devices?: boolean
                  data_scope_location?: boolean
                  data_scope_sessions?: boolean
                  data_scope_summary?: boolean
                  granted?: boolean
                  granted_at?: string | null
                  id?: string
                  parent_id?: string
                  research_purpose?: string | null
                  researcher_id?: string
                }
                Relationships: []
              }
              research_logs: {
                Row: {
                  action_type: string
                  analysis_id: string | null
                  child_id: string
                  created_at: string
                  id: string
                  notes: string | null
                  researcher_id: string
                }
                Insert: {
                  action_type: string
                  analysis_id?: string | null
                  child_id: string
                  created_at: string
                  id?: string
                  notes?: string | null
                  researcher_id: string
                }
                Update: {
                  action_type?: string
                  analysis_id?: string | null
                  child_id?: string
                  created_at?: string
                  id?: string
                  notes?: string | null
                  researcher_id?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "research_logs_researcher_id_fkey"
                    columns: ["researcher_id"]
                    isOneToOne: false
                    referencedRelation: "researchers"
                    referencedColumns: ["id"]
                  },
                ]
              }
              researchers: {
                Row: {
                  created_at: string
                  id: string
                  profile_id: string
                }
                Insert: {
                  created_at?: string
                  id: string
                  profile_id: string
                }
                Update: {
                  created_at?: string
                  id?: string
                  profile_id?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "researchers_id_fkey"
                    columns: ["id"]
                    isOneToOne: true
                    referencedRelation: "profiles"
                    referencedColumns: ["id"]
                  },
                ]
              }
              screen_activity_analysis: {
                Row: {
                  analysis_data: Json | null
                  analysis_date: string
                  child_id: string
                  created_at: string
                  id: string
                  most_used_app: string | null
                  peak_usage_hour: number | null
                  total_screen_time: number | null
                }
                Insert: {
                  analysis_data?: Json | null
                  analysis_date: string
                  child_id: string
                  created_at?: string
                  id?: string
                  most_used_app?: string | null
                  peak_usage_hour?: number | null
                  total_screen_time?: number | null
                }
                Update: {
                  analysis_data?: Json | null
                  analysis_date?: string
                  child_id?: string
                  created_at?: string
                  id?: string
                  most_used_app?: string | null
                  peak_usage_hour?: number | null
                  total_screen_time?: number | null
                }
                Relationships: [
                  {
                    foreignKeyName: "screen_activity_analysis_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              screen_activity_logs: {
                Row: {
                  activity_date: string
                  child_id: string
                  created_at: string
                  device_type: string
                  hours_educational: number
                  hours_entertainment: number
                  hours_screen_time: number
                  id: string
                  notes: string | null
                  parent_id: string
                }
                Insert: {
                  activity_date: string
                  child_id: string
                  created_at?: string
                  device_type: string
                  hours_educational: number
                  hours_entertainment: number
                  hours_screen_time: number
                  id?: string
                  notes?: string | null
                  parent_id: string
                }
                Update: {
                  activity_date?: string
                  child_id?: string
                  created_at?: string
                  device_type?: string
                  hours_educational?: number
                  hours_entertainment?: number
                  hours_screen_time?: number
                  id?: string
                  notes?: string | null
                  parent_id?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "screen_activity_logs_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
              screen_sessions: {
                Row: {
                  child_id: string
                  created_at: string
                  device_id: string
                  device_metadata: Json | null
                  duration_minutes: number | null
                  end_time: string | null
                  id: string
                  ip_address: string | null
                  location: string | null
                  session_type: string | null
                  start_time: string
                  user_agent: string | null
                }
                Insert: {
                  child_id: string
                  created_at?: string
                  device_id: string
                  device_metadata?: Json | null
                  duration_minutes?: number | null
                  end_time?: string | null
                  id?: string
                  ip_address?: string | null
                  location?: string | null
                  session_type?: string | null
                  start_time: string
                  user_agent?: string | null
                }
                Update: {
                  child_id?: string
                  created_at?: string
                  device_id?: string
                  device_metadata?: Json | null
                  duration_minutes?: number | null
                  end_time?: string | null
                  id?: string
                  ip_address?: string | null
                  location?: string | null
                  session_type?: string | null
                  start_time?: string
                  user_agent?: string | null
                }
                Relationships: [
                  {
                    foreignKeyName: "screen_sessions_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                  {
                    foreignKeyName: "screen_sessions_device_id_fkey"
                    columns: ["device_id"]
                    isOneToOne: false
                    referencedRelation: "devices"
                    referencedColumns: ["id"]
                  },
                ]
              }
              task_completions: {
                Row: {
                  child_id: string
                  completed_at: string
                  id: string
                  notes: string | null
                  reviewed_at: string | null
                  status: string
                  task_id: string
                }
                Insert: {
                  child_id: string
                  completed_at?: string
                  id?: string
                  notes?: string | null
                  reviewed_at?: string | null
                  status: string
                  task_id: string
                }
                Update: {
                  child_id?: string
                  completed_at?: string
                  id?: string
                  notes?: string | null
                  reviewed_at?: string | null
                  status?: string
                  task_id?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "task_completions_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                  {
                    foreignKeyName: "task_completions_task_id_fkey"
                    columns: ["task_id"]
                    isOneToOne: false
                    referencedRelation: "tasks"
                    referencedColumns: ["id"]
                  },
                ]
              }
              task_templates: {
                Row: {
                  category: string
                  created_at: string
                  created_by: string | null
                  default_reward_minutes: number
                  description: string | null
                  id: string
                  is_system: boolean
                  title: string
                }
                Insert: {
                  category?: string
                  created_at?: string
                  created_by?: string | null
                  default_reward_minutes?: number
                  description?: string | null
                  id?: string
                  is_system?: boolean
                  title: string
                }
                Update: {
                  category?: string
                  created_at?: string
                  created_by?: string | null
                  default_reward_minutes?: number
                  description?: string | null
                  id?: string
                  is_system?: boolean
                  title?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "task_templates_created_by_fkey"
                    columns: ["created_by"]
                    isOneToOne: false
                    referencedRelation: "users"
                    referencedColumns: ["id"]
                  }
                ]
              }
              tasks: {
                Row: {
                  created_at: string
                  description: string | null
                  id: string
                  is_recurring: boolean | null
                  parent_id: string
                  reward_minutes: number
                  title: string
                }
                Insert: {
                  created_at?: string
                  description?: string | null
                  id?: string
                  is_recurring?: boolean | null
                  parent_id: string
                  reward_minutes: number
                  title: string
                }
                Update: {
                  created_at?: string
                  description?: string | null
                  id?: string
                  is_recurring?: boolean | null
                  parent_id?: string
                  reward_minutes?: number
                  title?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "tasks_parent_id_fkey"
                    columns: ["parent_id"]
                    isOneToOne: false
                    referencedRelation: "profiles"
                    referencedColumns: ["id"]
                  },
                ]
              }
              user_roles: {
                Row: {
                  created_at: string | null
                  id: string
                  role: Database["public"]["Enums"]["user_role"]
                  user_id: string
                }
                Insert: {
                  created_at?: string | null
                  id?: string
                  role: Database["public"]["Enums"]["user_role"]
                  user_id: string
                }
                Update: {
                  created_at?: string | null
                  id?: string
                  role?: Database["public"]["Enums"]["user_role"]
                  user_id?: string
                }
                Relationships: []
              }
              user_sessions: {
                Row: {
                  created_at: string
                  id: string
                  ip_address: string | null
                  login_time: string
                  logout_time: string | null
                  session_duration_seconds: number | null
                  user_agent: string | null
                  user_id: string
                  user_role: string
                }
                Insert: {
                  created_at?: string
                  id?: string
                  ip_address?: string | null
                  login_time?: string
                  logout_time?: string | null
                  session_duration_seconds?: number | null
                  user_agent?: string | null
                  user_id: string
                  user_role: string
                }
                Update: {
                  created_at?: string
                  id?: string
                  ip_address?: string | null
                  login_time?: string
                  logout_time?: string | null
                  session_duration_seconds?: number | null
                  user_agent?: string | null
                  user_id?: string
                  user_role?: string
                }
                Relationships: []
              }
              weekly_reports: {
                Row: {
                  created_at: string
                  id: string
                  report_date: string
                  status: string
                  summary_json: Json
                  user_id: string
                }
                Insert: {
                  created_at?: string
                  id?: string
                  report_date: string
                  status: string
                  summary_json: Json
                  user_id: string
                }
                Update: {
                  created_at?: string
                  id?: string
                  report_date?: string
                  status?: string
                  summary_json?: Json
                  user_id?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "weekly_reports_user_id_fkey"
                    columns: ["user_id"]
                    isOneToOne: false
                    referencedRelation: "profiles"
                    referencedColumns: ["id"]
                  },
                ]
              }
              weekly_schedules: {
                Row: {
                  child_id: string
                  created_at: string
                  day_of_week: number
                  end_time: string
                  id: string
                  is_active: boolean | null
                  label: string
                  start_time: string
                }
                Insert: {
                  child_id: string
                  created_at?: string
                  day_of_week: number
                  end_time: string
                  id?: string
                  is_active?: boolean | null
                  label: string
                  start_time: string
                }
                Update: {
                  child_id?: string
                  created_at?: string
                  day_of_week?: number
                  end_time?: string
                  id?: string
                  is_active?: boolean | null
                  label?: string
                  start_time?: string
                }
                Relationships: [
                  {
                    foreignKeyName: "weekly_schedules_child_id_fkey"
                    columns: ["child_id"]
                    isOneToOne: false
                    referencedRelation: "children"
                    referencedColumns: ["id"]
                  },
                ]
              }
            }
            Views: {
              [_ in never]: never
            }
            Functions: {
              generate_child_display_id: {
                Args: { child_name: string; child_uuid: string }
                Returns: string
              }
              generate_device_display_id: {
                Args: { child_name: string; device_type: string; device_uuid: string }
                Returns: string
              }
              get_age_group_averages: {
                Args: {
                  age_group_param: Database["public"]["Enums"]["age_group_enum"]
                  end_date: string
                  start_date: string
                }
                Returns: number
              }
              get_user_role: {
                Args: { user_id: string }
                Returns: Database["public"]["Enums"]["user_role"]
              }
              has_role: {
                Args: {
                  _role: Database["public"]["Enums"]["user_role"]
                  _user_id: string
                }
                Returns: boolean
              }
            }
            Enums: {
              age_group_enum: "0-2" | "3-5" | "6-8" | "9-11" | "12-14" | "15-17" | "18+"
              user_role: "parent" | "researcher" | "admin"
            }
            CompositeTypes: {
              [_ in never]: never
            }
          }
        }

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      age_group_enum: ["0-2", "3-5", "6-8", "9-11", "12-14", "15-17", "18+"],
      user_role: ["parent", "researcher", "admin"],
    },
  },
} as const
