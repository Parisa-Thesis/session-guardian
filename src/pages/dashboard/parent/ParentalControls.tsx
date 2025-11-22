import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, Moon, Shield, CheckCircle, Bell } from "lucide-react";
import ParentalControlDialog from "@/components/dashboard/ParentalControlDialog";
import { useSessionMonitoring } from "@/hooks/useSessionMonitoring";
import { motion } from "framer-motion";

export default function ParentalControls() {
  const { data: children, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: controlsData, isLoading: isLoadingControls } = useQuery({
    queryKey: ["all-parental-controls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parental_controls")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: monitoring } = useSessionMonitoring();

  if (isLoadingChildren || isLoadingControls) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const activeWarnings = monitoring?.warnings || [];
  const errorWarnings = activeWarnings.filter((w) => w.severity === "error");
  const cautionWarnings = activeWarnings.filter((w) => w.severity === "warning");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Parental Controls</h1>
        <p className="text-muted-foreground mt-2">
          Set daily time limits and bedtime restrictions for your children
        </p>
      </div>

      {/* Active Warnings */}
      {activeWarnings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5" />
            Active Alerts
          </h2>
          {errorWarnings.map((warning, index) => (
            <motion.div
              key={`error-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{warning.childName}:</strong> {warning.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
          {cautionWarnings.map((warning, index) => (
            <motion.div
              key={`warning-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (errorWarnings.length + index) * 0.1 }}
            >
              <Alert className="border-orange-500/20 bg-orange-500/10">
                <Clock className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-foreground">
                  <strong>{warning.childName}:</strong> {warning.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Children</p>
              <p className="text-2xl font-bold text-foreground">{children?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Controls Enabled</p>
              <p className="text-2xl font-bold text-foreground">
                {controlsData?.filter((c) => c.enabled).length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold text-foreground">{activeWarnings.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Children Controls */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Manage Controls</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {children?.map((child, index) => {
            const control = controlsData?.find((c) => c.child_id === child.id);
            const childWarnings = activeWarnings.filter((w) => w.childId === child.id);

            return (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age Group: {child.age_group || "Not set"}
                      </p>
                    </div>
                    <Badge variant={control?.enabled ? "default" : "secondary"}>
                      {control?.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  {childWarnings.length > 0 && (
                    <div className="mb-3 p-2 rounded-md bg-orange-500/10 border border-orange-500/20">
                      <p className="text-sm font-medium text-orange-500 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {childWarnings.length} active alert{childWarnings.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4 text-sm">
                    {control?.daily_time_limit_minutes ? (
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Daily Limit: {control.daily_time_limit_minutes} minutes</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>No daily limit set</span>
                      </div>
                    )}

                    {control?.bedtime_start && control?.bedtime_end ? (
                      <div className="flex items-center gap-2 text-foreground">
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Bedtime: {control.bedtime_start} - {control.bedtime_end}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Moon className="h-4 w-4" />
                        <span>No bedtime restrictions</span>
                      </div>
                    )}
                  </div>

                  <ParentalControlDialog childId={child.id} childName={child.name} />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {!children || children.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Children Added</h3>
          <p className="text-muted-foreground">
            Add children profiles first to set up parental controls.
          </p>
        </Card>
      )}
    </div>
  );
}
