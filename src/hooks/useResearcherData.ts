import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useResearcherData = () => {
  return useQuery({
    queryKey: ["researcher-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get consented children
      const { data: consents } = await supabase
        .from("consents")
        .select("*, children(*)")
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
    },
  });
};
