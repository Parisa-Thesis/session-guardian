import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  // Fetch notification preferences from database
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Create or update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: {
      browser_enabled?: boolean;
      notify_on_limit?: boolean;
      notify_on_bedtime?: boolean;
      notify_on_warning?: boolean;
    }) => {
      if (!userId) throw new Error("Not authenticated");

      if (!preferences) {
        // Create new preferences
        const { error } = await supabase.from("notification_preferences").insert({
          user_id: userId,
          ...updates,
        });
        if (error) throw error;
      } else {
        // Update existing preferences
        const { error } = await supabase
          .from("notification_preferences")
          .update(updates)
          .eq("user_id", userId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", userId] });
    },
  });

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    }
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await updatePreferencesMutation.mutateAsync({ browser_enabled: true });
        toast.success("Notifications enabled!");
        return true;
      } else if (permission === "denied") {
        await updatePreferencesMutation.mutateAsync({ browser_enabled: false });
        toast.error(
          "Notifications are currently disabled in your browser. You can enable them from this site's notification settings."
        );
        return false;
      }
    }
    return false;
  };

  const disableNotifications = async () => {
    await updatePreferencesMutation.mutateAsync({ browser_enabled: false });
    toast.success("Notifications disabled");
  };

  const updatePreference = async (key: string, value: boolean) => {
    await updatePreferencesMutation.mutateAsync({ [key]: value });
  };

  const isSupported = "Notification" in window;
  const browserPermissionGranted = isSupported && Notification.permission === "granted";
  const isEnabled = preferences?.browser_enabled || false;

  return {
    sendNotification,
    requestPermission,
    disableNotifications,
    updatePreference,
    isSupported,
    isGranted: browserPermissionGranted && isEnabled,
    browserPermissionGranted,
    preferences,
    isLoading,
  };
};
