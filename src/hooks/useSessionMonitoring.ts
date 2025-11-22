import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInMinutes } from "date-fns";

export const useSessionMonitoring = () => {
  return useQuery({
    queryKey: ["session-monitoring"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch active sessions with child info
      const { data: sessions } = await supabase
        .from("screen_sessions")
        .select("*, children!inner(*), devices(*)")
        .eq("children.parent_id", user.id)
        .is("end_time", null);

      // Fetch today's activity logs
      const today = new Date().toISOString().split("T")[0];
      const { data: todayLogs } = await supabase
        .from("screen_activity_logs")
        .select("*")
        .eq("parent_id", user.id)
        .eq("activity_date", today);

      // Fetch parental controls
      const { data: controls } = await supabase
        .from("parental_controls")
        .select("*")
        .eq("enabled", true);

      // Calculate usage and warnings
      const warnings: any[] = [];

      (sessions || []).forEach((session: any) => {
        const control = controls?.find((c) => c.child_id === session.child_id);
        if (!control) return;

        const sessionMinutes = differenceInMinutes(
          new Date(),
          new Date(session.start_time)
        );

        // Calculate today's total usage
        const todayUsage = (todayLogs || [])
          .filter((log: any) => log.child_id === session.child_id)
          .reduce((sum: number, log: any) => sum + (log.hours_screen_time * 60), 0);

        const totalMinutesToday = todayUsage + sessionMinutes;

        // Check daily limit
        if (control.daily_time_limit_minutes) {
          const remaining = control.daily_time_limit_minutes - totalMinutesToday;
          const threshold = control.warning_threshold_minutes || 15;

          if (remaining <= 0) {
            warnings.push({
              type: "limit_exceeded",
              severity: "error",
              childId: session.child_id,
              childName: session.children.name,
              message: `Daily limit exceeded by ${Math.abs(remaining)} minutes`,
              minutesOver: Math.abs(remaining),
            });
          } else if (remaining <= threshold) {
            warnings.push({
              type: "approaching_limit",
              severity: "warning",
              childId: session.child_id,
              childName: session.children.name,
              message: `${remaining} minutes remaining until daily limit`,
              minutesRemaining: remaining,
            });
          }
        }

        // Check bedtime
        if (control.bedtime_start && control.bedtime_end) {
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          
          const [startHour, startMin] = control.bedtime_start.split(":").map(Number);
          const [endHour, endMin] = control.bedtime_end.split(":").map(Number);
          
          const bedtimeStart = startHour * 60 + startMin;
          const bedtimeEnd = endHour * 60 + endMin;

          const isInBedtime = bedtimeEnd < bedtimeStart
            ? currentTime >= bedtimeStart || currentTime < bedtimeEnd
            : currentTime >= bedtimeStart && currentTime < bedtimeEnd;

          if (isInBedtime) {
            warnings.push({
              type: "bedtime_violation",
              severity: "error",
              childId: session.child_id,
              childName: session.children.name,
              message: `Active during bedtime (${control.bedtime_start} - ${control.bedtime_end})`,
            });
          }
        }
      });

      return {
        sessions: sessions || [],
        warnings,
        controls: controls || [],
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
