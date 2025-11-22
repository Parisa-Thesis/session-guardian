import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useParentData = () => {
  return useQuery({
    queryKey: ["parent-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch children
      const { data: children } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id);

      // Fetch devices
      const { data: devices } = await supabase
        .from("devices")
        .select("*, children!inner(*)")
        .eq("children.parent_id", user.id);

      // Fetch active sessions
      const { data: activeSessions } = await supabase
        .from("screen_sessions")
        .select("*, children!inner(*)")
        .eq("children.parent_id", user.id)
        .is("end_time", null);

      // Fetch recent activity logs
      const { data: activityLogs } = await supabase
        .from("screen_activity_logs")
        .select("*, children!inner(*)")
        .eq("parent_id", user.id)
        .order("activity_date", { ascending: false })
        .limit(10);

      return {
        children: children || [],
        devices: devices || [],
        activeSessions: activeSessions || [],
        activityLogs: activityLogs || [],
      };
    },
  });
};
