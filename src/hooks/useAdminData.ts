import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminData = () => {
  return useQuery({
    queryKey: ["admin-data"],
    queryFn: async () => {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") throw new Error("Unauthorized");

      // Fetch all profiles with counts
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Count users by role
      const totalUsers = profiles?.length || 0;
      const parentCount = profiles?.filter(p => p.role === "parent").length || 0;
      const researcherCount = profiles?.filter(p => p.role === "researcher").length || 0;
      const adminCount = profiles?.filter(p => p.role === "admin").length || 0;

      // Fetch devices count
      const { count: devicesCount } = await supabase
        .from("devices")
        .select("*", { count: "exact", head: true });

      // Fetch recent sessions
      const { data: recentSessions } = await supabase
        .from("user_sessions")
        .select("*")
        .order("login_time", { ascending: false })
        .limit(10);

      // Fetch children count
      const { count: childrenCount } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true });

      return {
        profiles: profiles || [],
        stats: {
          totalUsers,
          parentCount,
          researcherCount,
          adminCount,
          devicesCount: devicesCount || 0,
          childrenCount: childrenCount || 0,
        },
        recentSessions: recentSessions || [],
      };
    },
  });
};
