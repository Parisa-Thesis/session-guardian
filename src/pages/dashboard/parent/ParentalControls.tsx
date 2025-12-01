import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityDashboard } from "@/components/parental-controls/ActivityDashboard";
import { QuickActions } from "@/components/parental-controls/QuickActions";
import { ScreenTimeLimitCard } from "@/components/parental-controls/ScreenTimeLimitCard";
import { ScheduleManager } from "@/components/parental-controls/ScheduleManager";
import { AppControlsList } from "@/components/parental-controls/AppControlsList";
import { ActivityTimeline } from "@/components/parental-controls/ActivityTimeline";
import { subDays, startOfDay, endOfDay } from "date-fns";

export default function ParentalControls() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  // Fetch children
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id);
      return data || [];
    },
  });

  // Auto-select first child
  if (children && children.length > 0 && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const selectedChild = children?.find(c => c.id === selectedChildId);

  // Fetch parental controls
  const { data: control } = useQuery({
    queryKey: ["parental-control", selectedChildId],
    queryFn: async () => {
      const { data } = await supabase
        .from("parental_controls")
        .select("*")
        .eq("child_id", selectedChildId)
        .single();
      return data;
    },
    enabled: !!selectedChildId,
  });

  // Fetch today's screen time
  const { data: todayScreenTime } = useQuery({
    queryKey: ["today-screen-time", selectedChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_today_screen_time', { p_child_id: selectedChildId });
      if (error) throw error;
      return data || 0;
    },
    enabled: !!selectedChildId,
  });

  // Fetch weekly screen time
  const { data: weeklyScreenTime } = useQuery({
    queryKey: ["weekly-screen-time", selectedChildId],
    queryFn: async () => {
      const startDate = startOfDay(subDays(new Date(), 7));
      const endDate = endOfDay(new Date());

      const { data } = await supabase
        .from("activity_timeline")
        .select("duration_minutes")
        .eq("child_id", selectedChildId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      return data?.reduce((sum, a) => sum + a.duration_minutes, 0) || 0;
    },
    enabled: !!selectedChildId,
  });

  // Fetch current activity
  const { data: currentActivity } = useQuery({
    queryKey: ["current-activity", selectedChildId],
    queryFn: async () => {
      const { data } = await supabase
        .from("activity_timeline")
        .select("*")
        .eq("child_id", selectedChildId)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!selectedChildId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch active instant action
  const { data: activeAction } = useQuery({
    queryKey: ["active-action", selectedChildId],
    queryFn: async () => {
      const { data } = await supabase
        .rpc('get_active_instant_action', { p_child_id: selectedChildId });
      return data?.[0];
    },
    enabled: !!selectedChildId,
  });

  // Fetch schedules
  const { data: schedules } = useQuery({
    queryKey: ["schedules", selectedChildId],
    queryFn: async () => {
      const { data } = await supabase
        .from("schedules")
        .select("*")
        .eq("child_id", selectedChildId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!selectedChildId,
  });

  // Fetch app controls
  const { data: appControls } = useQuery({
    queryKey: ["app-controls", selectedChildId],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_controls")
        .select("*")
        .eq("child_id", selectedChildId)
        .order("app_name");
      return data || [];
    },
    enabled: !!selectedChildId,
  });

  // Fetch activity timeline
  const { data: activities } = useQuery({
    queryKey: ["activity-timeline", selectedChildId, selectedDate],
    queryFn: async () => {
      const startDate = startOfDay(selectedDate);
      const endDate = endOfDay(selectedDate);

      const { data } = await supabase
        .from("activity_timeline")
        .select("*")
        .eq("child_id", selectedChildId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time");
      return data || [];
    },
    enabled: !!selectedChildId,
  });

  // Mutations
  const pauseDevice = useMutation({
    mutationFn: async ({ childId, reason }: { childId: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("instant_actions")
        .insert({
          child_id: childId,
          parent_id: user.id,
          action_type: "pause",
          reason,
          is_active: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("All devices paused");
      queryClient.invalidateQueries({ queryKey: ["active-action"] });
    },
    onError: (error: any) => {
      toast.error("Failed to pause devices: " + error.message);
    },
  });

  const unlockDevice = useMutation({
    mutationFn: async (childId: string) => {
      const { error } = await supabase
        .from("instant_actions")
        .update({ is_active: false })
        .eq("child_id", childId)
        .eq("action_type", "pause")
        .eq("is_active", true);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("All devices unlocked");
      queryClient.invalidateQueries({ queryKey: ["active-action"] });
    },
    onError: (error: any) => {
      toast.error("Failed to unlock devices: " + error.message);
    },
  });

  const grantTime = useMutation({
    mutationFn: async ({ childId, minutes, reason }: { childId: string; minutes: number; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

      const { error } = await supabase
        .from("instant_actions")
        .insert({
          child_id: childId,
          parent_id: user.id,
          action_type: "grant_time",
          duration_minutes: minutes,
          reason,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Granted ${variables.minutes} minutes of extra time`);
      queryClient.invalidateQueries({ queryKey: ["active-action"] });
    },
    onError: (error: any) => {
      toast.error("Failed to grant time: " + error.message);
    },
  });

  const updateDailyLimit = useMutation({
    mutationFn: async (minutes: number) => {
      const { error } = await supabase
        .from("parental_controls")
        .upsert({
          child_id: selectedChildId,
          daily_time_limit_minutes: minutes,
          enabled: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Daily limit updated");
      queryClient.invalidateQueries({ queryKey: ["parental-control"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update limit: " + error.message);
    },
  });

  const addSchedule = useMutation({
    mutationFn: async (schedule: any) => {
      const { error } = await supabase
        .from("schedules")
        .insert({ ...schedule, child_id: selectedChildId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Schedule added");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("schedules")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Schedule updated");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Schedule deleted");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const addApp = useMutation({
    mutationFn: async (app: any) => {
      const { error } = await supabase
        .from("app_controls")
        .insert({ ...app, child_id: selectedChildId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("App added");
      queryClient.invalidateQueries({ queryKey: ["app-controls"] });
    },
  });

  const updateApp = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("app_controls")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-controls"] });
    },
  });

  if (!children || children.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">No Children Added</h1>
        <p className="text-muted-foreground">Add a child profile to start using parental controls.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parental Controls</h1>
          <p className="text-muted-foreground">Monitor and manage your child's screen time</p>
        </div>
        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select child" />
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

      {selectedChild && (
        <>
          {/* Dashboard */}
          <ActivityDashboard
            childName={selectedChild.name}
            currentApp={currentActivity?.app_name || null}
            isActive={!!currentActivity}
            todayMinutes={todayScreenTime || 0}
            dailyLimitMinutes={control?.daily_time_limit_minutes || 180}
            weeklyMinutes={weeklyScreenTime || 0}
            weeklyChange={0}
          />

          {/* Quick Actions */}
          <QuickActions
            childId={selectedChildId}
            childName={selectedChild.name}
            onPauseDevice={(id, reason) => pauseDevice.mutateAsync({ childId: id, reason })}
            onUnlockDevice={(id) => unlockDevice.mutateAsync(id)}
            onGrantTime={(id, minutes, reason) => grantTime.mutateAsync({ childId: id, minutes, reason })}
            isPaused={activeAction?.action_type === 'pause'}
          />

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="apps">Apps</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ScreenTimeLimitCard
                dailyLimitMinutes={control?.daily_time_limit_minutes || 180}
                todayMinutes={todayScreenTime || 0}
                onUpdateLimit={(minutes) => updateDailyLimit.mutateAsync(minutes)}
              />
            </TabsContent>

            <TabsContent value="apps">
              <AppControlsList
                appControls={appControls || []}
                onUpdateApp={(id, updates) => updateApp.mutateAsync({ id, updates })}
                onAddApp={(app) => addApp.mutateAsync(app)}
              />
            </TabsContent>

            <TabsContent value="schedules">
              <ScheduleManager
                schedules={schedules || []}
                availableApps={appControls || []}
                onAddSchedule={(schedule) => addSchedule.mutateAsync(schedule)}
                onUpdateSchedule={(id, updates) => updateSchedule.mutateAsync({ id, updates })}
                onDeleteSchedule={(id) => deleteSchedule.mutateAsync(id)}
              />
            </TabsContent>

            <TabsContent value="timeline">
              <ActivityTimeline
                activities={activities || []}
                selectedDate={selectedDate}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
