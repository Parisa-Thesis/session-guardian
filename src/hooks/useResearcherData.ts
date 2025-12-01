import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResearcherData = () => {
  return useQuery({
    queryKey: ["researcher-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get consented children
      const { data: consents } = await supabase
        .from("consents")
        .select(`
          *,
          children(*),
          profiles!consents_parent_id_fkey(name, email)
        `)
        .eq("granted", true);

      const consentedChildIds = consents?.map(c => c.child_id) || [];

      if (consentedChildIds.length === 0) {
        return {
          consents: [],
          activityLogs: [],
          aggregates: {
            daily: [],
            weekly: [],
            monthly: [],
          },
          stats: {
            totalChildren: 0,
            totalDataPoints: 0,
            avgScreenTime: 0,
          },
        };
      }

      // Get activity logs for consented children
      const { data: activityLogs } = await supabase
        .from("screen_activity_logs")
        .select("*")
        .in("child_id", consentedChildIds)
        .order("activity_date", { ascending: false })
        .limit(100);

      // Get daily aggregates
      const { data: dailyAggregates } = await supabase
        .from("child_daily_aggregate")
        .select("*")
        .in("child_id", consentedChildIds)
        .order("activity_date", { ascending: false })
        .limit(30);

      // Get weekly aggregates
      const { data: weeklyAggregates } = await supabase
        .from("child_weekly_aggregate")
        .select("*")
        .in("child_id", consentedChildIds)
        .order("week_start", { ascending: false })
        .limit(12);

      // Get monthly aggregates
      const { data: monthlyAggregates } = await supabase
        .from("child_monthly_aggregate")
        .select("*")
        .in("child_id", consentedChildIds)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(12);

      // Calculate stats
      const totalDataPoints = (activityLogs?.length || 0) +
        (dailyAggregates?.length || 0) +
        (weeklyAggregates?.length || 0);

      const avgScreenTime = activityLogs?.length
        ? activityLogs.reduce((sum, log) => sum + log.hours_screen_time, 0) / activityLogs.length
        : 0;

      return {
        consents: consents || [],
        activityLogs: activityLogs || [],
        aggregates: {
          daily: dailyAggregates || [],
          weekly: weeklyAggregates || [],
          monthly: monthlyAggregates || [],
        },
        stats: {
          totalChildren: consentedChildIds.length,
          totalDataPoints,
          avgScreenTime: Number(avgScreenTime.toFixed(2)),
        },
      };
      // Get cohorts
      const { data: cohorts } = await supabase
        .from("cohorts")
        .select(`
          *,
          cohort_members (
            child_id
          )
        `)
        .eq("researcher_id", user.id);

      return {
        consents: consents || [],
        activityLogs: activityLogs || [],
        cohorts: cohorts || [],
        aggregates: {
          daily: dailyAggregates || [],
          weekly: weeklyAggregates || [],
          monthly: monthlyAggregates || [],
        },
        stats: {
          totalChildren: consentedChildIds.length,
          totalDataPoints,
          avgScreenTime: Number(avgScreenTime.toFixed(2)),
        },
      };
    },
  });
};

export const useCohortMutations = () => {
  const queryClient = useQueryClient();

  const createCohort = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("cohorts")
        .insert({ researcher_id: user.id, name, description });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researcher-data"] });
      toast.success("Cohort created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating cohort: ${error.message}`);
    },
  });

  const deleteCohort = useMutation({
    mutationFn: async (cohortId: string) => {
      const { error } = await supabase
        .from("cohorts")
        .delete()
        .eq("id", cohortId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researcher-data"] });
      toast.success("Cohort deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting cohort: ${error.message}`);
    },
  });

  const addCohortMember = useMutation({
    mutationFn: async ({ cohortId, childId }: { cohortId: string; childId: string }) => {
      const { error } = await supabase
        .from("cohort_members")
        .insert({ cohort_id: cohortId, child_id: childId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researcher-data"] });
      toast.success("Member added to cohort");
    },
    onError: (error) => {
      toast.error(`Error adding member: ${error.message}`);
    },
  });

  const removeCohortMember = useMutation({
    mutationFn: async ({ cohortId, childId }: { cohortId: string; childId: string }) => {
      const { error } = await supabase
        .from("cohort_members")
        .delete()
        .eq("cohort_id", cohortId)
        .eq("child_id", childId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researcher-data"] });
      toast.success("Member removed from cohort");
    },
    onError: (error) => {
      toast.error(`Error removing member: ${error.message}`);
    },
  });

  return {
    createCohort,
    deleteCohort,
    addCohortMember,
    removeCohortMember,
  };
};
