import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const NotificationSettings = () => {
  const {
    isSupported,
    isGranted,
    browserPermissionGranted,
    requestPermission,
    disableNotifications,
    sendNotification,
    updatePreference,
    preferences,
    isLoading,
  } = useNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification("Screen Guardian", {
        body: "Notifications are now enabled! You'll be alerted about important events.",
      });
    }
  };

  const handleDisableNotifications = async () => {
    await disableNotifications();
  };

  const handleTestNotification = () => {
    if (isGranted) {
      sendNotification("Test Notification", {
        body: "This is a test notification from Screen Guardian",
      });
      toast.success("Test notification sent!");
    } else {
      toast.error("Please enable notifications first");
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support notifications. Try using Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Get instant alerts when your children exceed screen time limits or during bedtime hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="flex items-center gap-3">
            {isGranted ? (
              <div className="p-2 rounded-full bg-green-500/10">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {isGranted ? "Notifications Enabled" : "Notifications Disabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isGranted
                  ? "You'll receive browser notifications"
                  : !browserPermissionGranted
                  ? "Browser permission required"
                  : "Enable to get instant alerts"}
              </p>
            </div>
          </div>
          <Badge variant={isGranted ? "default" : "secondary"} className={isGranted ? "bg-green-500" : ""}>
            {isGranted ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* Enable/Disable Button */}
        {!browserPermissionGranted ? (
          <Button onClick={handleEnableNotifications} className="w-full" size="lg">
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
        ) : (
          <div className="flex gap-2">
            {!isGranted ? (
              <Button onClick={handleEnableNotifications} className="flex-1" size="lg">
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </Button>
            ) : (
              <Button
                onClick={handleDisableNotifications}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <BellOff className="mr-2 h-4 w-4" />
                Disable Notifications
              </Button>
            )}
          </div>
        )}

        {/* Notification Preferences */}
        {isGranted && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-limit">Daily Limit Exceeded</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when a child exceeds their daily screen time limit
                </p>
              </div>
              <Switch
                id="notify-limit"
                checked={preferences?.notify_on_limit ?? true}
                onCheckedChange={(checked) => updatePreference("notify_on_limit", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-bedtime">Bedtime Violations</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when device is used during bedtime hours
                </p>
              </div>
              <Switch
                id="notify-bedtime"
                checked={preferences?.notify_on_bedtime ?? true}
                onCheckedChange={(checked) => updatePreference("notify_on_bedtime", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-warning">Warning Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when approaching daily limit (15 mins before)
                </p>
              </div>
              <Switch
                id="notify-warning"
                checked={preferences?.notify_on_warning ?? true}
                onCheckedChange={(checked) => updatePreference("notify_on_warning", checked)}
              />
            </div>

            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="w-full"
            >
              <Bell className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
