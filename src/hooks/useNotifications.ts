import { useEffect } from "react";
import { toast } from "sonner";

export const useNotifications = () => {
  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast.success("Browser notifications enabled!");
        }
      });
    }
  }, []);

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
        toast.success("Notifications enabled!");
        return true;
      } else if (permission === "denied") {
        toast.error("Notifications blocked. Please enable in browser settings.");
        return false;
      }
    }
    return false;
  };

  const isSupported = "Notification" in window;
  const isGranted = isSupported && Notification.permission === "granted";

  return {
    sendNotification,
    requestPermission,
    isSupported,
    isGranted,
  };
};
