import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Monitor, Laptop, Trash2, Tv, Gamepad2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddDeviceDialog } from "@/components/dashboard/AddDeviceDialog";
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

const Devices = () => {
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("devices")
        .select(`
          *,
          children (
            id,
            name,
            parent_id,
            display_id
          )
        `)
        .eq("children.parent_id", user.id)
        .order("created_at", { ascending: false });

      return data || [];
    },
  });

  const handleDelete = async (id: string, deviceType: string) => {
    try {
      const { error } = await supabase
        .from("devices")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`${deviceType} removed successfully`);
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to remove device");
    }
  };

  const getDeviceIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      Tablet: Tablet,
      Phone: Smartphone,
      Laptop: Laptop,
      Desktop: Monitor,
      TV: Tv,
      "Game Console": Gamepad2,
    };
    return iconMap[type] || Smartphone;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Devices</h1>
          <p className="text-muted-foreground mt-2">Manage connected devices for your children</p>
        </div>
        <AddDeviceDialog onDeviceAdded={() => queryClient.invalidateQueries({ queryKey: ["devices"] })} />
      </div>

      {devices && devices.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device: any, index) => {
            const Icon = getDeviceIcon(device.device_type);
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
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
                            <AlertDialogTitle>Remove Device?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this device. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(device.id, device.device_type)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <CardTitle className="mt-4">{device.device_type}</CardTitle>
                    <CardDescription>{device.children?.name}'s device</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {device.display_id && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Device ID:</span>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {device.display_id}
                        </Badge>
                      </div>
                    )}
                    {device.children?.display_id && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Child ID:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {device.children.display_id}
                        </Badge>
                      </div>
                    )}
                    {(device.device_name || device.model) && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-medium">{device.device_name || device.model}</span>
                      </div>
                    )}
                    {device.os && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">OS:</span>
                        <Badge variant="secondary" className="font-normal">
                          {device.os}
                        </Badge>
                      </div>
                    )}
                    {device.ip_address && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">IP:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{device.ip_address}</code>
                      </div>
                    )}
                    {device.last_used_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Used:</span>
                        <span className="text-xs">{new Date(device.last_used_at).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(device.created_at).toLocaleDateString()}
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
            <Smartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No devices registered yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first device to start tracking screen time
            </p>
            <AddDeviceDialog onDeviceAdded={() => queryClient.invalidateQueries({ queryKey: ["devices"] })} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Devices;
