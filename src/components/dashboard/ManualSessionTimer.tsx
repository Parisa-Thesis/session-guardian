import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, StopCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { differenceInSeconds } from "date-fns";

interface ManualSessionTimerProps {
  children: any[];
  devices: any[];
  activeSessions: any[];
}

export const ManualSessionTimer = ({ children, devices, activeSessions }: ManualSessionTimerProps) => {
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [sessionDurations, setSessionDurations] = useState<Record<string, number>>({});

  // Update session durations every second
  useEffect(() => {
    const interval = setInterval(() => {
      const durations: Record<string, number> = {};
      activeSessions.forEach((session) => {
        const seconds = differenceInSeconds(new Date(), new Date(session.start_time));
        durations[session.id] = seconds;
      });
      setSessionDurations(durations);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSessions]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async () => {
    if (!selectedChild || !selectedDevice) {
      toast.error("Please select both child and device");
      return;
    }

    // Check if there's already an active session for this child and device
    const existingSession = activeSessions.find(
      (s) => s.child_id === selectedChild && s.device_id === selectedDevice && !s.end_time
    );

    if (existingSession) {
      toast.error("There's already an active session for this child on this device");
      return;
    }

    const { error } = await supabase.from("screen_sessions").insert({
      child_id: selectedChild,
      device_id: selectedDevice,
      start_time: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to start session: " + error.message);
    } else {
      toast.success("Session started!");
      queryClient.invalidateQueries({ queryKey: ["parent-data"] });
      queryClient.invalidateQueries({ queryKey: ["session-monitoring"] });
      setSelectedChild("");
      setSelectedDevice("");
    }
  };

  const handleStopSession = async (sessionId: string) => {
    const session = activeSessions.find((s) => s.id === sessionId);
    if (!session) return;

    const endTime = new Date();
    const durationMinutes = Math.floor(
      differenceInSeconds(endTime, new Date(session.start_time)) / 60
    );

    const { error } = await supabase
      .from("screen_sessions")
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq("id", sessionId);

    if (error) {
      toast.error("Failed to stop session: " + error.message);
    } else {
      toast.success(`Session ended! Duration: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`);
      queryClient.invalidateQueries({ queryKey: ["parent-data"] });
      queryClient.invalidateQueries({ queryKey: ["session-monitoring"] });
    }
  };

  const childDevices = selectedChild
    ? devices.filter((d) => d.child_id === selectedChild)
    : [];

  return (
    <div className="space-y-6">
      {/* Start New Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            Start Manual Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Child</label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Device</label>
              <Select
                value={selectedDevice}
                onValueChange={setSelectedDevice}
                disabled={!selectedChild}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a device" />
                </SelectTrigger>
                <SelectContent>
                  {childDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.device_type} - {device.model || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleStartSession}
            disabled={!selectedChild || !selectedDevice}
            className="w-full"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500 animate-pulse" />
              Active Sessions ({activeSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSessions.map((session) => {
              const child = children.find((c) => c.id === session.child_id);
              const device = devices.find((d) => d.id === session.device_id);
              const duration = sessionDurations[session.id] || 0;

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{child?.name}</p>
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {device?.device_type} - {device?.model || "Unknown"}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono font-bold text-lg">
                        {formatDuration(duration)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStopSession(session.id)}
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
