import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSessionTracking = () => {
  const sessionIdRef = useRef<string | null>(null);
  const loginTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    const startSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const loginTime = new Date();
      loginTimeRef.current = loginTime;

      // Create session log
      const { data: session, error } = await supabase
        .from("user_sessions")
        .insert({
          user_id: user.id,
          user_role: profile?.role || "parent",
          login_time: loginTime.toISOString(),
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (!error && session) {
        sessionIdRef.current = session.id;
        console.log("Session started:", session.id, "at", loginTime.toISOString());
      }
    };

    const endSession = async () => {
      if (!sessionIdRef.current || !loginTimeRef.current) return;

      const logoutTime = new Date();
      const durationSeconds = Math.floor(
        (logoutTime.getTime() - loginTimeRef.current.getTime()) / 1000
      );

      await supabase
        .from("user_sessions")
        .update({
          logout_time: logoutTime.toISOString(),
          session_duration_seconds: durationSeconds,
        })
        .eq("id", sessionIdRef.current);

      console.log("Session ended:", sessionIdRef.current, "Duration:", durationSeconds, "seconds");
    };

    // Start session when component mounts
    startSession();

    // End session on page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      endSession();
    };
  }, []);

  return null;
};
