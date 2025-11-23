import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, device_id, child_id, device_identifier } = await req.json();

    console.log("Auto session tracker:", { action, device_id, child_id, device_identifier });

    if (action === "start") {
      // Check if there's already an active session for this device/child
      const { data: existingSessions } = await supabaseClient
        .from("screen_sessions")
        .select("*")
        .eq("child_id", child_id)
        .eq("device_id", device_id)
        .is("end_time", null);

      if (existingSessions && existingSessions.length > 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Session already active",
            session_id: existingSessions[0].id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Start a new session
      const { data: newSession, error: insertError } = await supabaseClient
        .from("screen_sessions")
        .insert({
          child_id,
          device_id,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("New session started:", newSession);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Session started",
          session_id: newSession.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "stop") {
      // Find active session and stop it
      const { data: activeSessions } = await supabaseClient
        .from("screen_sessions")
        .select("*")
        .eq("child_id", child_id)
        .eq("device_id", device_id)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1);

      if (!activeSessions || activeSessions.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No active session found",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }

      const session = activeSessions[0];
      const endTime = new Date();
      const startTime = new Date(session.start_time);
      const durationMinutes = Math.floor(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      const { error: updateError } = await supabaseClient
        .from("screen_sessions")
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq("id", session.id);

      if (updateError) throw updateError;

      console.log("Session stopped:", {
        session_id: session.id,
        duration_minutes: durationMinutes,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Session stopped",
          session_id: session.id,
          duration_minutes: durationMinutes,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "heartbeat") {
      // Update last activity timestamp for active session
      const { data: activeSessions } = await supabaseClient
        .from("screen_sessions")
        .select("*")
        .eq("child_id", child_id)
        .eq("device_id", device_id)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1);

      if (activeSessions && activeSessions.length > 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Session active",
            session_id: activeSessions[0].id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: "No active session",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid action. Use 'start', 'stop', or 'heartbeat'",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
