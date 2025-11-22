import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Baby, User, UserCircle, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddChildDialog } from "@/components/dashboard/AddChildDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

const Children = () => {
  const queryClient = useQueryClient();

  const { data: children, isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      return data || [];
    },
  });

  const handleDelete = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`${name} removed successfully`);
      queryClient.invalidateQueries({ queryKey: ["children"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to remove child");
    }
  };

  const getAgeIcon = (ageGroup: string) => {
    if (["0-2", "3-5"].includes(ageGroup)) return Baby;
    if (["6-8", "9-11"].includes(ageGroup)) return User;
    return UserCircle;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Children Profiles</h1>
          <p className="text-muted-foreground mt-2">Manage your children's profiles and anonymous IDs</p>
        </div>
        <AddChildDialog onChildAdded={() => queryClient.invalidateQueries({ queryKey: ["children"] })} />
      </div>

      {children && children.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child, index) => {
            const AgeIcon = getAgeIcon(child.age_group || "");
            return (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <AgeIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{child.name}</CardTitle>
                          <CardDescription className="mt-1">
                            Age: {child.age_group}
                          </CardDescription>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {child.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this child's profile and all associated data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(child.id, child.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-xs text-muted-foreground mb-1">Anonymous ID</p>
                      <code className="text-lg font-mono font-bold text-primary">
                        {child.anonymous_id}
                      </code>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant="secondary" className="font-normal">
                        {child.age_group} years
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(child.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No children profiles yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first child profile to start monitoring their screen time
            </p>
            <AddChildDialog onChildAdded={() => queryClient.invalidateQueries({ queryKey: ["children"] })} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Children;
