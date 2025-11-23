import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useParentData } from "@/hooks/useParentData";
import { format, differenceInMinutes } from "date-fns";
import { ManualSessionTimer } from "@/components/dashboard/ManualSessionTimer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Sessions = () => {
  const { data: parentData, isLoading } = useParentData();

  // Fetch all sessions (both active and completed)
  const { data: allSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["all-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("screen_sessions")
        .select("*, children!inner(*), devices(*)")
        .eq("children.parent_id", user.id)
        .order("start_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const activeSessions = parentData?.activeSessions || [];
  const completedSessions = allSessions?.filter((s) => s.end_time) || [];

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateActiveDuration = (startTime: string) => {
    const minutes = differenceInMinutes(new Date(), new Date(startTime));
    return formatDuration(minutes);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Screen Sessions</h1>
        <p className="text-muted-foreground">
          Manage and monitor device usage sessions for your children
        </p>
      </div>

      <Tabs defaultValue="timer" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timer" className="gap-2">
            <Clock className="h-4 w-4" />
            Session Timer
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Session History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer">
          <ManualSessionTimer
            children={parentData?.children || []}
            devices={parentData?.devices || []}
            activeSessions={activeSessions}
          />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                Complete log of all screen time sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedSessions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No completed sessions yet</p>
                </div>
              ) : (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Child</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedSessions.map((session: any) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.children?.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{session.devices?.device_type}</div>
                            <div className="text-xs text-muted-foreground">
                              {session.devices?.device_name || session.devices?.model || "Unknown"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={session.session_type === "manual" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {session.session_type || "auto"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(session.start_time), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell>
                          {session.end_time
                            ? format(new Date(session.end_time), "MMM d, HH:mm")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {session.end_time
                            ? formatDuration(session.duration_minutes)
                            : calculateActiveDuration(session.start_time)}
                        </TableCell>
                        <TableCell>
                          {session.ip_address ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">{session.ip_address}</code>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {session.location || <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={session.end_time ? "secondary" : "default"}>
                            {session.end_time ? "Completed" : "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sessions;
