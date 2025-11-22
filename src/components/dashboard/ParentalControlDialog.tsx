import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useParentalControls } from "@/hooks/useParentalControls";
import { toast } from "sonner";

interface ParentalControlDialogProps {
  childId: string;
  childName: string;
}

export default function ParentalControlDialog({ childId, childName }: ParentalControlDialogProps) {
  const [open, setOpen] = useState(false);
  const { controls, upsertControls, isUpserting } = useParentalControls(childId);

  const [enabled, setEnabled] = useState(controls?.enabled ?? true);
  const [dailyLimit, setDailyLimit] = useState(controls?.daily_time_limit_minutes?.toString() || "");
  const [bedtimeStart, setBedtimeStart] = useState(controls?.bedtime_start || "");
  const [bedtimeEnd, setBedtimeEnd] = useState(controls?.bedtime_end || "");
  const [warningThreshold, setWarningThreshold] = useState(
    controls?.warning_threshold_minutes?.toString() || "15"
  );

  const handleSave = () => {
    upsertControls(
      {
        child_id: childId,
        enabled,
        daily_time_limit_minutes: dailyLimit ? parseInt(dailyLimit) : null,
        bedtime_start: bedtimeStart || null,
        bedtime_end: bedtimeEnd || null,
        warning_threshold_minutes: parseInt(warningThreshold),
      },
      {
        onSuccess: () => {
          toast.success("Parental controls updated");
          setOpen(false);
        },
        onError: (error) => {
          toast.error("Failed to update controls: " + error.message);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Controls
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Parental Controls for {childName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="text-base">
              Enable Controls
            </Label>
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily-limit">Daily Time Limit (minutes)</Label>
            <Input
              id="daily-limit"
              type="number"
              placeholder="e.g., 120 for 2 hours"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              disabled={!enabled}
            />
            <p className="text-xs text-muted-foreground">Leave empty for no limit</p>
          </div>

          <div className="space-y-4">
            <Label>Bedtime Restrictions</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedtime-start" className="text-sm">
                  Start Time
                </Label>
                <Input
                  id="bedtime-start"
                  type="time"
                  value={bedtimeStart}
                  onChange={(e) => setBedtimeStart(e.target.value)}
                  disabled={!enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedtime-end" className="text-sm">
                  End Time
                </Label>
                <Input
                  id="bedtime-end"
                  type="time"
                  value={bedtimeEnd}
                  onChange={(e) => setBedtimeEnd(e.target.value)}
                  disabled={!enabled}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to disable bedtime restrictions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warning-threshold">Warning Threshold (minutes)</Label>
            <Input
              id="warning-threshold"
              type="number"
              placeholder="15"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(e.target.value)}
              disabled={!enabled}
            />
            <p className="text-xs text-muted-foreground">
              Show warning this many minutes before hitting daily limit
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpserting} className="flex-1">
              {isUpserting ? "Saving..." : "Save Controls"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
