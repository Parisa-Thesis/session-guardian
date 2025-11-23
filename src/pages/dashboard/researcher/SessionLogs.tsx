import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function SessionLogs() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["researcher-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_role", "parent")
        .order("login_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Active";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Session Logs</h1>
          <p className="text-muted-foreground">Parent user login/logout activity</p>
        </div>
      </div>

      {!sessions || sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Session Data</h3>
          <p className="text-muted-foreground">No parent sessions have been recorded yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {session.user_id.slice(0, 8)}...
                      </Badge>
                      {!session.logout_time && (
                        <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Login</p>
                          <p className="font-medium">
                            {format(new Date(session.login_time), "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Logout</p>
                          <p className="font-medium">
                            {session.logout_time
                              ? format(new Date(session.logout_time), "MMM d, yyyy HH:mm")
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">
                            {formatDuration(session.session_duration_seconds)}
                          </p>
                        </div>
                      </div>

                      {session.user_agent && (
                        <div>
                          <p className="text-muted-foreground">Device</p>
                          <p className="font-medium text-xs truncate">
                            {session.user_agent.split(" ")[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
