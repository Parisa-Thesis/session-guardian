import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Gamepad2, Clock, Smartphone, Calendar, Trash2, Filter, Play, Square } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddActivityLogDialog } from "@/components/dashboard/AddActivityLogDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";

const ActivityLogs = () => {
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState<string>("all");

  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("name");

      return data || [];
    },
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity-logs", selectedChild],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("screen_activity_logs")
        .select(`
          *,
          children (
            id,
            name,
            age_group
          )
        `)
        .eq("parent_id", user.id)
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (selectedChild !== "all") {
        query = query.eq("child_id", selectedChild);
      }

      const { data } = await query.limit(50);
      return data || [];
    },
  });

  const { data: activeSessions, isLoading: isLoadingActiveSessions } = useQuery({
    queryKey: ["active-sessions", selectedChild],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("screen_sessions")
        .select(`
          *,
          children!inner (
            id,
            name,
            parent_id
          ),
          devices (
            device_type,
            device_name
          )
        `)
        .eq("children.parent_id", user.id)
        .is("end_time", null)
        .order("start_time", { ascending: false });

      if (selectedChild !== "all") {
        query = query.eq("child_id", selectedChild);
      }

      const { data } = await query;
      return data || [];
    },
    refetchInterval: 5000,
  });

  const { data: completedSessions, isLoading: isLoadingCompletedSessions } = useQuery({
    queryKey: ["completed-sessions", selectedChild],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("screen_sessions")
        .select(`
          *,
          children!inner (
            id,
            name,
            parent_id
          ),
          devices (
            device_type,
            device_name
          )
        `)
        .eq("children.parent_id", user.id)
        .not("end_time", "is", null)
        .order("start_time", { ascending: false });

      if (selectedChild !== "all") {
        query = query.eq("child_id", selectedChild);
      }

      const { data } = await query.limit(50);
      return data || [];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("screen_activity_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Activity log deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete activity log");
    }
  };

  const getTotalStats = () => {
    if (!logs) return { total: 0, educational: 0, entertainment: 0 };
    
    return logs.reduce((acc, log: any) => ({
      total: acc.total + (log.hours_screen_time || 0),
      educational: acc.educational + (log.hours_educational || 0),
      entertainment: acc.entertainment + (log.hours_entertainment || 0),
    }), { total: 0, educational: 0, entertainment: 0 });
  };

  const stats = getTotalStats();

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateActiveDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return formatDuration(diffMins);
  };

  if (isLoading || isLoadingActiveSessions || isLoadingCompletedSessions) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Activity Logs & Sessions</h1>
          <p className="text-muted-foreground mt-2">Track and monitor all screen time activities</p>
        </div>
        <AddActivityLogDialog onLogAdded={() => {
          queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
          queryClient.invalidateQueries({ queryKey: ["parent-data"] });
        }} />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Screen Time</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}h</div>
              <p className="text-xs text-muted-foreground mt-1">Logged activities</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Educational Time</CardTitle>
              <div className="p-2 rounded-lg bg-secondary/10">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.educational}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? `${Math.round((stats.educational / stats.total) * 100)}%` : '0%'} of total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entertainment Time</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <Gamepad2 className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.entertainment}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? `${Math.round((stats.entertainment / stats.total) * 100)}%` : '0%'} of total
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Logs
              </CardTitle>
              <CardDescription>Filter activity logs by child</CardDescription>
            </div>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All children" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All children</SelectItem>
                {children?.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            <Play className="h-4 w-4 mr-2" />
            Active Sessions ({activeSessions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Clock className="h-4 w-4 mr-2" />
            Manual Logs ({logs?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-2" />
            Session History ({completedSessions?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="active" className="space-y-4 mt-4">
          {activeSessions && activeSessions.length > 0 ? (
            <div className="space-y-4">
              {activeSessions.map((session: any, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-primary-foreground animate-pulse">
                              <Play className="h-3 w-3 mr-1" />
                              LIVE
                            </Badge>
                            <h3 className="text-lg font-semibold">{session.children?.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Smartphone className="h-3 w-3" />
                              <span>{session.devices?.device_type || "Unknown Device"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(session.start_time), "PPp")}</span>
                            </div>
                          </div>

                          <div className="bg-background/50 rounded-md p-3 inline-block">
                            <div className="text-sm text-muted-foreground mb-1">Duration</div>
                            <div className="text-2xl font-bold text-primary">
                              {calculateActiveDuration(session.start_time)}
                            </div>
                          </div>

                          {session.location && (
                            <p className="text-xs text-muted-foreground">
                              Location: {session.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No active sessions</h3>
                <p className="text-muted-foreground">
                  No children are currently using their devices
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manual Logs Tab */}
        <TabsContent value="manual" className="space-y-4 mt-4">
          {logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log: any, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">{log.children?.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(log.activity_date), "MMMM d, yyyy")}</span>
                                <span>•</span>
                                <Smartphone className="h-3 w-3" />
                                <span>{log.device_type}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Badge variant="outline" className="gap-1 bg-primary/5">
                              <Clock className="h-3 w-3" />
                              {log.hours_screen_time}h total
                            </Badge>
                            {log.hours_educational > 0 && (
                              <Badge variant="secondary" className="gap-1">
                                <BookOpen className="h-3 w-3" />
                                {log.hours_educational}h educational
                              </Badge>
                            )}
                            {log.hours_entertainment > 0 && (
                              <Badge variant="outline" className="gap-1 bg-accent/5">
                                <Gamepad2 className="h-3 w-3" />
                                {log.hours_entertainment}h entertainment
                              </Badge>
                            )}
                          </div>

                          {log.notes && (
                            <div className="rounded-lg bg-muted p-3">
                              <p className="text-sm text-muted-foreground italic">{log.notes}</p>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Logged on {format(new Date(log.created_at), "PPp")}
                          </p>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Activity Log?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this activity log. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(log.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No manual logs yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start logging your children's screen time activities manually
                </p>
                <AddActivityLogDialog onLogAdded={() => {
                  queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
                  queryClient.invalidateQueries({ queryKey: ["parent-data"] });
                }} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Session History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {completedSessions && completedSessions.length > 0 ? (
            <div className="space-y-4">
              {completedSessions.map((session: any, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant={session.session_type === "manual" ? "secondary" : "outline"}>
                              {session.session_type === "manual" ? "Manual" : "Auto"}
                            </Badge>
                            <h3 className="text-lg font-semibold">{session.children?.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Smartphone className="h-3 w-3" />
                              <span>{session.devices?.device_type || "Unknown Device"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(session.start_time), "PPp")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Square className="h-3 w-3" />
                              <span>{format(new Date(session.end_time), "PPp")}</span>
                            </div>
                          </div>

                          <Badge variant="outline" className="gap-1 bg-primary/5">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.duration_minutes)}
                          </Badge>

                          {session.location && (
                            <p className="text-xs text-muted-foreground">
                              Location: {session.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No session history</h3>
                <p className="text-muted-foreground">
                  Completed sessions will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityLogs;
