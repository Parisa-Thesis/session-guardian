import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Smartphone, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const deviceSchema = z.object({
  childId: z.string().uuid({ message: "Please select a child" }),
  deviceType: z.string()
    .trim()
    .min(1, { message: "Device type is required" })
    .max(50, { message: "Device type must be less than 50 characters" }),
  os: z.string()
    .trim()
    .max(50, { message: "OS must be less than 50 characters" })
    .optional(),
  model: z.string()
    .trim()
    .max(100, { message: "Model must be less than 100 characters" })
    .optional(),
});

interface AddDeviceDialogProps {
  onDeviceAdded?: () => void;
}

export function AddDeviceDialog({ onDeviceAdded }: AddDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    childId: "",
    deviceType: "",
    os: "",
    model: "",
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
      deviceSchema.parse(formData);
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
      const { error } = await supabase
        .from("devices")
        .insert({
          child_id: formData.childId,
          device_type: formData.deviceType.trim(),
          os: formData.os.trim() || null,
          model: formData.model.trim() || null,
        });

      if (error) throw error;

      toast.success("Device added successfully!");
      setOpen(false);
      setFormData({ childId: "", deviceType: "", os: "", model: "" });
      setErrors({});
      onDeviceAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Smartphone className="h-4 w-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>
            Link a new device to one of your children's profiles.
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
            <Label htmlFor="os">Operating System (Optional)</Label>
            <Input
              id="os"
              placeholder="e.g., iOS 17, Android 14"
              value={formData.os}
              onChange={(e) => setFormData({ ...formData, os: e.target.value })}
              className={errors.os ? "border-destructive" : ""}
              maxLength={50}
            />
            {errors.os && (
              <p className="text-sm text-destructive">{errors.os}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model (Optional)</Label>
            <Input
              id="model"
              placeholder="e.g., iPad Pro, Galaxy S23"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className={errors.model ? "border-destructive" : ""}
              maxLength={100}
            />
            {errors.model && (
              <p className="text-sm text-destructive">{errors.model}</p>
            )}
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
              Add Device
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
