import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export const NotificationSettings = () => {
  const { isSupported, isGranted, requestPermission, sendNotification } = useNotifications();
  const [notifyOnLimit, setNotifyOnLimit] = useState(true);
  const [notifyOnBedtime, setNotifyOnBedtime] = useState(true);
  const [notifyOnWarning, setNotifyOnWarning] = useState(true);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification("Screen Guardian", {
        body: "Notifications are now enabled! You'll be alerted about important events.",
      });
    }
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
                  : "Enable to get instant alerts"}
              </p>
            </div>
          </div>
          <Badge variant={isGranted ? "default" : "secondary"}>
            {isGranted ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Enable Button */}
        {!isGranted && (
          <Button onClick={handleEnableNotifications} className="w-full" size="lg">
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
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
                checked={notifyOnLimit}
                onCheckedChange={setNotifyOnLimit}
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
                checked={notifyOnBedtime}
                onCheckedChange={setNotifyOnBedtime}
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
                checked={notifyOnWarning}
                onCheckedChange={setNotifyOnWarning}
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
