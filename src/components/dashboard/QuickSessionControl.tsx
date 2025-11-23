import { useState, useEffect } from "react";
import { Play, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function QuickSessionControl() {
  const queryClient = useQueryClient();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch active manual sessions
  const { data: activeSessions } = useQuery({
    queryKey: ["quick-active-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("screen_sessions")
        .select(`
          *,
          children!inner(id, name, parent_id, display_id),
          devices!inner(id, device_type, device_name, model, display_id)
        `)
        .eq("children.parent_id", user.id)
        .eq("session_type", "manual")
        .is("end_time", null)
        .order("start_time", { ascending: false });

      return data || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch children and devices for start dialog
  const { data: children } = useQuery({
    queryKey: ["children-quick"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("name");

      return data || [];
    },
    enabled: showStartDialog,
  });

  const { data: devices } = useQuery({
    queryKey: ["devices-quick", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];

      const { data } = await supabase
        .from("devices")
        .select("*")
        .eq("child_id", selectedChild)
        .order("device_type");

      return data || [];
    },
    enabled: showStartDialog && !!selectedChild,
  });

  const handleStartSession = async () => {
    if (!selectedChild || !selectedDevice) {
      toast.error("Please select both child and device");
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("screen_sessions")
        .insert({
          child_id: selectedChild,
          device_id: selectedDevice,
          start_time: now,
          session_type: "manual",
        });

      if (error) throw error;

      toast.success("Session started!");
      setShowStartDialog(false);
      setSelectedChild("");
      setSelectedDevice("");
      queryClient.invalidateQueries({ queryKey: ["quick-active-sessions"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const { data: session } = await supabase
        .from("screen_sessions")
        .select("start_time")
        .eq("id", sessionId)
        .single();

      if (!session) throw new Error("Session not found");

      const durationMinutes = Math.floor(
        (new Date(now).getTime() - new Date(session.start_time).getTime()) / 60000
      );

      const { error } = await supabase
        .from("screen_sessions")
        .update({
          end_time: now,
          duration_minutes: durationMinutes,
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Session stopped!");
      queryClient.invalidateQueries({ queryKey: ["quick-active-sessions"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to stop session");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSessions = activeSessions && activeSessions.length > 0;

  return (
    <>
      <div className="px-3 py-2 space-y-2">
        <Button
          variant={hasActiveSessions ? "destructive" : "default"}
          className="w-full justify-start gap-2"
          onClick={() => hasActiveSessions ? handleStopSession(activeSessions[0].id) : setShowStartDialog(true)}
          disabled={loading}
        >
          {hasActiveSessions ? (
            <>
              <Square className="h-4 w-4" />
              <span>Stop Session</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Start Session</span>
            </>
          )}
        </Button>

        {hasActiveSessions && (
          <div className="text-xs space-y-1 px-2 py-1.5 bg-muted rounded-md">
            {activeSessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{session.children.name}</p>
                  <p className="text-muted-foreground truncate">
                    {session.devices.device_type}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  Manual
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Manual Session</DialogTitle>
            <DialogDescription>
              Select a child and device to start tracking screen time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="child">Child</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children?.map((child: any) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Select 
                value={selectedDevice} 
                onValueChange={setSelectedDevice}
                disabled={!selectedChild}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices?.map((device: any) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.device_type} {device.model && `- ${device.model}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowStartDialog(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartSession}
                className="flex-1"
                disabled={loading || !selectedChild || !selectedDevice}
              >
                Start Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
