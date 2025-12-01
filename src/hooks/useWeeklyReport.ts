import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export const useWeeklyReport = (targetUserId?: string) => {
    const queryClient = useQueryClient();

    const { data: reports, isLoading } = useQuery({
        queryKey: ["weekly-reports", targetUserId],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // If targetUserId is provided (for researchers), use that. Otherwise use current user (parent).
            const userIdToCheck = targetUserId || user.id;

            const { data, error } = await supabase
                .from("weekly_reports")
                .select("*")
                .eq("user_id", userIdToCheck)
                .order("report_date", { ascending: false });

            if (error) {
                console.error("Error fetching reports:", error);
                // If error is RLS related, it might return empty or throw. 
                // For now, we return empty array if error.
                return [];
            }
            return data;
        },
        enabled: !targetUserId || !!targetUserId, // Always enabled if no target, or if target is present
    });

    const generateReport = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const endDate = new Date();
            const startDate = subDays(endDate, 7);
            const startDateStr = format(startDate, "yyyy-MM-dd");
            const endDateStr = format(endDate, "yyyy-MM-dd");

            // 1. Fetch aggregate data for the last week
            const { data: aggregates } = await supabase
                .from("child_daily_aggregate")
                .select("*")
                .in("child_id", (await supabase.from("children").select("id").eq("parent_id", user.id)).data?.map(c => c.id) || [])
                .gte("date", startDateStr)
                .lte("date", endDateStr);

            // 2. Calculate stats
            let totalScreenTime = 0;
            let totalEducational = 0;
            let totalEntertainment = 0;
            let bonusMinutes = 0;

            aggregates?.forEach(agg => {
                totalScreenTime += (agg.total_screen_time_seconds || 0) / 60;
                totalEducational += (agg.educational_screen_time_seconds || 0) / 60;
                totalEntertainment += (agg.entertainment_screen_time_seconds || 0) / 60;
                bonusMinutes += agg.bonus_minutes || 0;
            });

            // 3. Create summary JSON
            const summary = {
                total_screen_time: Math.round(totalScreenTime),
                educational_minutes: Math.round(totalEducational),
                entertainment_minutes: Math.round(totalEntertainment),
                bonus_minutes_earned: bonusMinutes,
                period_start: startDateStr,
                period_end: endDateStr,
                generated_at: new Date().toISOString()
            };

            // 4. Insert report
            const { error } = await supabase
                .from("weekly_reports")
                .insert({
                    user_id: user.id,
                    report_date: endDateStr,
                    summary_json: summary,
                    status: "generated"
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weekly-reports"] });
            toast.success("Weekly report generated successfully.");
        },
        onError: (error) => {
            toast.error(`Failed to generate report: ${error.message}`);
        }
    });

    return {
        reports,
        isLoading,
        generateReport,
    };
};
