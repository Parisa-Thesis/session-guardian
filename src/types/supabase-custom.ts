import { Database } from "@/integrations/supabase/types";

export type AppControl = {
    id: string;
    child_id: string;
    app_name: string;
    app_category: 'games' | 'social' | 'educational' | 'entertainment' | 'productivity' | 'other';
    is_blocked: boolean;
    daily_limit_minutes: number | null;
    is_unlimited: boolean;
    created_at: string;
    updated_at: string;
};

export type Schedule = {
    id: string;
    child_id: string;
    name: string;
    schedule_type: 'bedtime' | 'school' | 'homework' | 'custom';
    start_time: string;
    end_time: string;
    days_of_week: number[];
    allowed_apps: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type InstantAction = {
    id: string;
    child_id: string;
    parent_id: string;
    action_type: 'pause' | 'unlock' | 'grant_time';
    duration_minutes: number | null;
    reason: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
};

export type ActivityTimeline = {
    id: string;
    child_id: string;
    device_id: string | null;
    app_name: string;
    app_category: string | null;
    start_time: string;
    end_time: string | null;
    duration_minutes: number;
    created_at: string;
};

// Extend the existing Database type if possible, or just use these types directly
export type CustomDatabase = Database & {
    public: {
        Tables: {
            app_controls: {
                Row: AppControl;
                Insert: Omit<AppControl, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<AppControl, 'id' | 'created_at' | 'updated_at'>>;
            };
            schedules: {
                Row: Schedule;
                Insert: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Schedule, 'id' | 'created_at' | 'updated_at'>>;
            };
            instant_actions: {
                Row: InstantAction;
                Insert: Omit<InstantAction, 'id' | 'created_at'>;
                Update: Partial<Omit<InstantAction, 'id' | 'created_at'>>;
            };
            activity_timeline: {
                Row: ActivityTimeline;
                Insert: Omit<ActivityTimeline, 'id' | 'created_at'>;
                Update: Partial<Omit<ActivityTimeline, 'id' | 'created_at'>>;
            };
        };
    };
};
