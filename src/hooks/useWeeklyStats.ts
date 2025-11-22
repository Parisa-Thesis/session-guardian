import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export const useWeeklyStats = () => {
  return useQuery({
    queryKey: ["weekly-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date();
      const sevenDaysAgo = subDays(today, 7);

      const { data: logs } = await supabase
        .from("screen_activity_logs")
        .select("*")
        .eq("parent_id", user.id)
        .gte("activity_date", format(sevenDaysAgo, "yyyy-MM-dd"))
        .lte("activity_date", format(today, "yyyy-MM-dd"));

      // Group by date
      const dailyData = (logs || []).reduce((acc: any, log: any) => {
        const date = log.activity_date;
        if (!acc[date]) {
          acc[date] = {
            date,
            screenTime: 0,
            educational: 0,
            entertainment: 0,
          };
        }
        acc[date].screenTime += log.hours_screen_time || 0;
        acc[date].educational += log.hours_educational || 0;
        acc[date].entertainment += log.hours_entertainment || 0;
        return acc;
      }, {});

      return Object.values(dailyData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
  });
};
