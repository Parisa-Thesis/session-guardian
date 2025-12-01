import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomDatabase } from "@/types/supabase-custom";

// Helper to cast supabase client to use custom types
const supabaseCustom = supabase as unknown as {
  from: (table: string) => any;
  rpc: (fn: string, args: any) => any;
};

export const useParentalControls = (childId?: string) => {
  const queryClient = useQueryClient();

  const { data: controls, isLoading } = useQuery({
    queryKey: ["parental-controls", childId],
    queryFn: async () => {
      if (!childId) return null;

      const { data, error } = await supabase
        .from("parental_controls")
        .select("*")
        .eq("child_id", childId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!childId,
  });

  // Updated to use the new 'schedules' table instead of 'weekly_schedules'
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["schedules", childId],
    queryFn: async () => {
      if (!childId) return [];
      const { data, error } = await supabaseCustom
        .from("schedules")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: {
      child_id: string;
      daily_time_limit_minutes?: number | null;
      bedtime_start?: string | null;
      bedtime_end?: string | null;
      warning_threshold_minutes?: number;
      enabled: boolean;
    }) => {
      const { data, error } = await supabase
        .from("parental_controls")
        .upsert(values, { onConflict: "child_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parental-controls"] });
    },
  });

  const setFocusMode = useMutation({
    mutationFn: async ({ childId, minutes }: { childId: string; minutes: number }) => {
      const until = new Date(Date.now() + minutes * 60000).toISOString();
      const { error } = await supabase
        .from("parental_controls")
        .update({ focus_mode_until: until })
        .eq("child_id", childId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parental-controls"] });
    },
  });

  // Updated to use 'schedules' table
  const addScheduleBlock = useMutation({
    mutationFn: async (schedule: any) => {
      const { error } = await supabaseCustom
        .from("schedules")
        .insert(schedule);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  // Updated to use 'schedules' table
  const deleteScheduleBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseCustom
        .from("schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  return {
    controls,
    schedules,
    isLoading: isLoading || isLoadingSchedules,
    upsertControls: upsertMutation.mutate,
    isUpserting: upsertMutation.isPending,
    setFocusMode,
    addScheduleBlock,
    deleteScheduleBlock,
  };
};
