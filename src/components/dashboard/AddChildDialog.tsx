import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { UserPlus, Loader2 } from "lucide-react";

const childSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" }),
  ageGroup: z.enum(["0-2", "3-5", "6-8", "9-11", "12-14", "15-17", "18+"], {
    errorMap: () => ({ message: "Please select an age group" })
  }),
});

interface AddChildDialogProps {
  onChildAdded?: () => void;
}

export function AddChildDialog({ onChildAdded }: AddChildDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      childSchema.parse(formData);
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

      // Generate anonymous ID (first letter + random string)
      const anonymousId = `${formData.name[0].toUpperCase()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const { error } = await supabase
        .from("children")
        .insert([{
          parent_id: user.id,
          name: formData.name.trim(),
          age_group: formData.ageGroup as "0-2" | "3-5" | "6-8" | "9-11" | "12-14" | "15-17" | "18+",
          anonymous_id: anonymousId,
        }]);

      if (error) throw error;

      toast.success(`${formData.name} added successfully!`);
      setOpen(false);
      setFormData({ name: "", ageGroup: "" });
      setErrors({});
      onChildAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add child");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Child Profile</DialogTitle>
          <DialogDescription>
            Create a new profile for your child. An anonymous ID will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Child's Name</Label>
            <Input
              id="name"
              placeholder="Enter child's name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageGroup">Age Group</Label>
            <Select
              value={formData.ageGroup}
              onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
            >
              <SelectTrigger className={errors.ageGroup ? "border-destructive" : ""}>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-8">6-8 years</SelectItem>
                <SelectItem value="9-11">9-11 years</SelectItem>
                <SelectItem value="12-14">12-14 years</SelectItem>
                <SelectItem value="15-17">15-17 years</SelectItem>
                <SelectItem value="18+">18+ years</SelectItem>
              </SelectContent>
            </Select>
            {errors.ageGroup && (
              <p className="text-sm text-destructive">{errors.ageGroup}</p>
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
              Add Child
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
