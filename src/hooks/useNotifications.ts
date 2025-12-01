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
    try {
      if (!("Notification" in window)) {
        toast.error("Notifications are not supported in your browser");
        return false;
      }

      console.log("Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);

      if (permission === "granted") {
        try {
          await updatePreferencesMutation.mutateAsync({ browser_enabled: true });
          toast.success("Notifications enabled!");
          return true;
        } catch (error: any) {
          console.error("Failed to save notification preference:", error);
          toast.error(`Failed to save settings: ${error.message || "Unknown error"}`);
          return false;
        }
      } else if (permission === "denied") {
        try {
          await updatePreferencesMutation.mutateAsync({ browser_enabled: false });
        } catch (error) {
          console.error("Failed to save denied preference:", error);
        }
        toast.error(
          "Notifications are currently disabled in your browser. You can enable them from this site's notification settings."
        );
        return false;
      } else {
        // Permission was dismissed/default
        toast.info("Notification permission was not granted");
        return false;
      }
    } catch (error: any) {
      console.error("Error requesting notification permission:", error);
      toast.error(`Failed to request permission: ${error.message || "Unknown error"}`);
      return false;
    }
  };

  const disableNotifications = async () => {
    try {
      await updatePreferencesMutation.mutateAsync({ browser_enabled: false });
      toast.success("Notifications disabled");
    } catch (error: any) {
      console.error("Failed to disable notifications:", error);
      toast.error(`Failed to disable notifications: ${error.message || "Unknown error"}`);
    }
  };

  const updatePreference = async (key: string, value: boolean) => {
    await updatePreferencesMutation.mutateAsync({ [key]: value });
  };

  const isSupported = "Notification" in window;
  const browserPermissionGranted = isSupported && Notification.permission === "granted";
  const isEnabled = preferences?.browser_enabled || false;

  // Sync browser permission with DB preferences
  useEffect(() => {
    if (userId && browserPermissionGranted && !isLoading) {
      if (!preferences) {
        // If browser permission is granted but no preferences exist, create them
        console.log("Syncing: Browser granted but no preferences found. Creating...");
        updatePreferencesMutation.mutate({ browser_enabled: true });
      }
    }
  }, [userId, browserPermissionGranted, preferences, isLoading]);

  // Consider it loading if we are syncing (browser granted but no prefs yet)
  const isSyncing = !!(userId && browserPermissionGranted && !preferences && !isLoading);

  return {
    sendNotification,
    requestPermission,
    disableNotifications,
    updatePreference,
    isSupported,
    isGranted: browserPermissionGranted && isEnabled,
    browserPermissionGranted,
    preferences,
    isLoading: isLoading || isSyncing || updatePreferencesMutation.isPending,
  };
};
