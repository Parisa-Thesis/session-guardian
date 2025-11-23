import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, LogIn, LogOut, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function SessionLogs() {
  const { t } = useTranslation();
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
    if (!seconds) return t('researcher.active');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parent Activity Logs</h1>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Track when parents log in and out of the system. This data helps understand engagement patterns and system usage by participating families.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <LogIn className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold text-foreground">{sessions?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-2xl font-bold text-foreground">
                {sessions?.filter((s) => !s.logout_time).length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Parents</p>
              <p className="text-2xl font-bold text-foreground">
                {new Set(sessions?.map((s) => s.user_id)).size || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
        {!sessions || sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Activity Data</h3>
            <p className="text-muted-foreground">
              No parent login sessions have been recorded yet.
            </p>
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
                        <Badge className="bg-green-500/10 text-green-500">{t('researcher.active')}</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">{t('researcher.login')}</p>
                          <p className="font-medium">
                            {format(new Date(session.login_time), "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">{t('researcher.logout')}</p>
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
                          <p className="text-muted-foreground">{t('researcher.duration')}</p>
                          <p className="font-medium">
                            {formatDuration(session.session_duration_seconds)}
                          </p>
                        </div>
                      </div>

                      {session.user_agent && (
                        <div>
                          <p className="text-muted-foreground">{t('researcher.device')}</p>
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
    </div>
  );
}
