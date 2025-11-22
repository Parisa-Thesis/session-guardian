import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, LogIn, LogOut, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function SessionLogs() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("login_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, "yyyy-MM-dd"),
      time: format(date, "HH:mm:ss.SSS"),
    };
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Active";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const activeSessions = sessions?.filter(s => !s.logout_time) || [];
  const completedSessions = sessions?.filter(s => s.logout_time) || [];

  const totalTime = completedSessions.reduce(
    (sum, session) => sum + (session.session_duration_seconds || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Session Logs</h1>
        <p className="text-muted-foreground mt-2">
          Detailed tracking of your application usage with millisecond precision
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <LogIn className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold text-foreground">{activeSessions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold text-foreground">{sessions?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Timer className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold text-foreground">{formatDuration(totalTime)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <LogOut className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold text-foreground">
                {completedSessions.length > 0
                  ? formatDuration(Math.floor(totalTime / completedSessions.length))
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Active Sessions
          </h2>
          <div className="space-y-3">
            {activeSessions.map((session, index) => {
              const loginTime = formatDateTime(session.login_time);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-6 border-green-500/20 bg-green-500/5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4 text-green-500" />
                          <p className="font-semibold text-foreground">Login Time</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Date: {loginTime.date}</p>
                        <p className="text-lg font-mono text-foreground">{loginTime.time}</p>
                        <p className="text-xs text-muted-foreground">
                          Role: {session.user_role}
                        </p>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600">Active Now</Badge>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Session History</h2>
        <div className="space-y-3">
          {completedSessions.map((session, index) => {
            const loginTime = formatDateTime(session.login_time);
            const logoutTime = session.logout_time ? formatDateTime(session.logout_time) : null;
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <LogIn className="h-4 w-4 text-green-500" />
                        <p className="font-semibold text-sm text-foreground">Login</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{loginTime.date}</p>
                      <p className="text-base font-mono text-foreground">{loginTime.time}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <LogOut className="h-4 w-4 text-orange-500" />
                        <p className="font-semibold text-sm text-foreground">Logout</p>
                      </div>
                      {logoutTime ? (
                        <>
                          <p className="text-xs text-muted-foreground mb-1">{logoutTime.date}</p>
                          <p className="text-base font-mono text-foreground">{logoutTime.time}</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-blue-500" />
                        <p className="font-semibold text-sm text-foreground">Duration</p>
                      </div>
                      <p className="text-base font-mono text-foreground">
                        {formatDuration(session.session_duration_seconds)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <p className="font-semibold text-sm text-foreground">Role</p>
                      </div>
                      <Badge variant="outline">{session.user_role}</Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {!sessions || sessions.length === 0 && (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Sessions Recorded</h3>
          <p className="text-muted-foreground">Your session logs will appear here</p>
        </Card>
      )}
    </div>
  );
}
