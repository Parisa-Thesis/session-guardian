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
          age: number | null
          created_at: string
          date_of_birth: string | null
          id: string
          name: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          name: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          name?: string
          parent_id?: string
          updated_at?: string
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
          consent_date: string | null
          consent_given: boolean
          consent_type: string | null
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          child_id: string
          consent_date?: string | null
          consent_given?: boolean
          consent_type?: string | null
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          child_id?: string
          consent_date?: string | null
          consent_given?: boolean
          consent_type?: string | null
          created_at?: string
          id?: string
          parent_id?: string
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
          device_type: string
          id: string
          manufacturer: string
          model: string
          os: string | null
        }
        Insert: {
          created_at?: string
          device_type: string
          id?: string
          manufacturer: string
          model: string
          os?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string
          id?: string
          manufacturer?: string
          model?: string
          os?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          child_id: string
          created_at: string
          device_catalog_id: string | null
          device_identifier: string | null
          device_name: string
          id: string
          last_active: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          device_catalog_id?: string | null
          device_identifier?: string | null
          device_name: string
          id?: string
          last_active?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          device_catalog_id?: string | null
          device_identifier?: string | null
          device_name?: string
          id?: string
          last_active?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_device_catalog_id_fkey"
            columns: ["device_catalog_id"]
            isOneToOne: false
            referencedRelation: "device_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      parental_checks: {
        Row: {
          child_id: string
          created_at: string
          id: string
          is_active: boolean | null
          parent_id: string
          rule_config: Json | null
          rule_type: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parent_id: string
          rule_config?: Json | null
          rule_type: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parent_id?: string
          rule_config?: Json | null
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parental_checks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parental_checks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          action: string
          data_accessed: string | null
          id: string
          researcher_id: string
          timestamp: string
        }
        Insert: {
          action: string
          data_accessed?: string | null
          id?: string
          researcher_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          data_accessed?: string | null
          id?: string
          researcher_id?: string
          timestamp?: string
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
          institution: string | null
          research_area: string | null
        }
        Insert: {
          created_at?: string
          id: string
          institution?: string | null
          research_area?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          institution?: string | null
          research_area?: string | null
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
          activity_type: string | null
          app_name: string | null
          child_id: string
          created_at: string
          device_id: string
          duration_minutes: number | null
          id: string
          session_id: string
          timestamp: string
        }
        Insert: {
          activity_type?: string | null
          app_name?: string | null
          child_id: string
          created_at?: string
          device_id: string
          duration_minutes?: number | null
          id?: string
          session_id: string
          timestamp?: string
        }
        Update: {
          activity_type?: string | null
          app_name?: string | null
          child_id?: string
          created_at?: string
          device_id?: string
          duration_minutes?: number | null
          id?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "screen_activity_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screen_activity_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screen_activity_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "screen_sessions"
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
          status: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          device_id: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          status?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          device_id?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          status?: string | null
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
      user_role: ["parent", "researcher", "admin"],
    },
  },
} as const
