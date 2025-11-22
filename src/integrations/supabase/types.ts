export type Json =
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
          id: string
          name: string
          parent_id: string
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group_enum"] | null
          anonymous_id: string
          created_at?: string
          id?: string
          name: string
          parent_id: string
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group_enum"] | null
          anonymous_id?: string
          created_at?: string
          id?: string
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
      consents: {
        Row: {
          child_id: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          parent_id: string
          researcher_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          parent_id: string
          researcher_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          parent_id?: string
          researcher_id?: string
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
          device_type: string
          id: string
          model: string | null
          os: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          device_type: string
          id?: string
          model?: string | null
          os?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          device_type?: string
          id?: string
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
          created_at: string
          flagged_behaviours: string | null
          id: string
          log_id: string
          recommendations: string | null
          researcher_id: string
          risk_score: number
          summary: string | null
        }
        Insert: {
          created_at?: string
          flagged_behaviours?: string | null
          id?: string
          log_id: string
          recommendations?: string | null
          researcher_id: string
          risk_score: number
          summary?: string | null
        }
        Update: {
          created_at?: string
          flagged_behaviours?: string | null
          id?: string
          log_id?: string
          recommendations?: string | null
          researcher_id?: string
          risk_score?: number
          summary?: string | null
        }
        Relationships: []
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
          duration_minutes: number | null
          end_time: string | null
          id: string
          start_time: string
        }
        Insert: {
          child_id: string
          created_at?: string
          device_id: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time: string
        }
        Update: {
          child_id?: string
          created_at?: string
          device_id?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
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
