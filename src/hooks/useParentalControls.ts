import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  return {
    controls,
    isLoading,
    upsertControls: upsertMutation.mutate,
    isUpserting: upsertMutation.isPending,
  };
};
