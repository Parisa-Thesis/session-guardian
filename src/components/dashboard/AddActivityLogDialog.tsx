import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Plus, Loader2, BookOpen, Gamepad2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const activityLogSchema = z.object({
  childId: z.string().uuid({ message: "Please select a child" }),
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
  hoursScreenTime: z.number()
    .min(0, { message: "Screen time cannot be negative" })
    .max(24, { message: "Screen time cannot exceed 24 hours" }),
  hoursEducational: z.number()
    .min(0, { message: "Educational time cannot be negative" })
    .max(24, { message: "Educational time cannot exceed 24 hours" }),
  hoursEntertainment: z.number()
    .min(0, { message: "Entertainment time cannot be negative" })
    .max(24, { message: "Entertainment time cannot exceed 24 hours" }),
  deviceType: z.string()
    .trim()
    .min(1, { message: "Device type is required" })
    .max(50, { message: "Device type must be less than 50 characters" }),
  notes: z.string()
    .max(500, { message: "Notes must be less than 500 characters" })
    .optional(),
}).refine(
  (data) => data.hoursEducational + data.hoursEntertainment <= data.hoursScreenTime,
  {
    message: "Educational + Entertainment hours cannot exceed total screen time",
    path: ["hoursScreenTime"],
  }
);

interface AddActivityLogDialogProps {
  onLogAdded?: () => void;
}

export function AddActivityLogDialog({ onLogAdded }: AddActivityLogDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    childId: "",
    activityDate: format(new Date(), "yyyy-MM-dd"),
    hoursScreenTime: "",
    hoursEducational: "",
    hoursEntertainment: "",
    deviceType: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch children for the select dropdown
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("name");

      return data || [];
    },
    enabled: open,
  });

  const validateForm = () => {
    try {
      const validationData = {
        ...formData,
        hoursScreenTime: parseFloat(formData.hoursScreenTime) || 0,
        hoursEducational: parseFloat(formData.hoursEducational) || 0,
        hoursEntertainment: parseFloat(formData.hoursEntertainment) || 0,
      };
      
      activityLogSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase
        .from("screen_activity_logs")
        .insert([{
          child_id: formData.childId,
          parent_id: user.id,
          activity_date: formData.activityDate,
          hours_screen_time: parseInt(formData.hoursScreenTime) || 0,
          hours_educational: parseInt(formData.hoursEducational) || 0,
          hours_entertainment: parseInt(formData.hoursEntertainment) || 0,
          device_type: formData.deviceType.trim(),
          notes: formData.notes.trim() || null,
        }]);

      if (error) throw error;

      toast.success("Activity logged successfully!");
      setOpen(false);
      setFormData({
        childId: "",
        activityDate: format(new Date(), "yyyy-MM-dd"),
        hoursScreenTime: "",
        hoursEducational: "",
        hoursEntertainment: "",
        deviceType: "",
        notes: "",
      });
      setErrors({});
      onLogAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to log activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Screen Time Activity</DialogTitle>
          <DialogDescription>
            Manually record your child's screen time with educational and entertainment breakdown.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="childId">Child</Label>
            <Select
              value={formData.childId}
              onValueChange={(value) => setFormData({ ...formData, childId: value })}
            >
              <SelectTrigger className={errors.childId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children?.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.childId && (
              <p className="text-sm text-destructive">{errors.childId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityDate">Date</Label>
            <Input
              id="activityDate"
              type="date"
              value={formData.activityDate}
              onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
              className={errors.activityDate ? "border-destructive" : ""}
              max={format(new Date(), "yyyy-MM-dd")}
            />
            {errors.activityDate && (
              <p className="text-sm text-destructive">{errors.activityDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoursScreenTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Total Screen Time (hours)
            </Label>
            <Input
              id="hoursScreenTime"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="e.g., 3.5"
              value={formData.hoursScreenTime}
              onChange={(e) => setFormData({ ...formData, hoursScreenTime: e.target.value })}
              className={errors.hoursScreenTime ? "border-destructive" : ""}
            />
            {errors.hoursScreenTime && (
              <p className="text-sm text-destructive">{errors.hoursScreenTime}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hoursEducational" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                Educational (hours)
              </Label>
              <Input
                id="hoursEducational"
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="e.g., 1.5"
                value={formData.hoursEducational}
                onChange={(e) => setFormData({ ...formData, hoursEducational: e.target.value })}
                className={errors.hoursEducational ? "border-destructive" : ""}
              />
              {errors.hoursEducational && (
                <p className="text-sm text-destructive">{errors.hoursEducational}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursEntertainment" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-accent" />
                Entertainment (hours)
              </Label>
              <Input
                id="hoursEntertainment"
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="e.g., 2"
                value={formData.hoursEntertainment}
                onChange={(e) => setFormData({ ...formData, hoursEntertainment: e.target.value })}
                className={errors.hoursEntertainment ? "border-destructive" : ""}
              />
              {errors.hoursEntertainment && (
                <p className="text-sm text-destructive">{errors.hoursEntertainment}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type</Label>
            <Select
              value={formData.deviceType}
              onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
            >
              <SelectTrigger className={errors.deviceType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
                <SelectItem value="TV">TV</SelectItem>
                <SelectItem value="Game Console">Game Console</SelectItem>
              </SelectContent>
            </Select>
            {errors.deviceType && (
              <p className="text-sm text-destructive">{errors.deviceType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about the activity..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={errors.notes ? "border-destructive" : ""}
              maxLength={500}
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Log Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
