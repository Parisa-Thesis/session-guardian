import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearcherData } from "@/hooks/useResearcherData";
import { Database, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ResearcherData() {
  const { data, isLoading } = useResearcherData();
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [searchId, setSearchId] = useState<string>("");

  // Fetch device catalog
  const { data: deviceCatalog } = useQuery({
    queryKey: ["device-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("device_catalog")
        .select("*")
        .order("device_type");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const filteredLogs = data?.activityLogs.filter(log => {
    const child = data?.consents.find(c => c.child_id === log.child_id);
    const anonymousId = (child?.children as any)?.anonymous_id || "";
    
    const matchesDevice = deviceFilter === "all" || log.device_type === deviceFilter;
    const matchesSearch = !searchId || anonymousId.toLowerCase().includes(searchId.toLowerCase());
    
    return matchesDevice && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Research Data</h1>
            <p className="text-muted-foreground">Raw anonymized data from consented participants</p>
          </div>
        </div>
      </div>

      {data?.stats.totalChildren !== 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 flex gap-4">
              <Input
                placeholder="Search by Anonymous ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="max-w-xs"
              />
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {deviceCatalog?.map((device) => (
                    <SelectItem key={device.id} value={device.device_type}>
                      {device.device_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {data?.stats.totalChildren === 0 ? (
        <Card className="p-12 text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            No parents have granted consent for data access yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Activity Logs ({filteredLogs.length} records)
            </h3>
            <div className="space-y-3">
              {filteredLogs.slice(0, 50).map((log, index) => {
                const child = data?.consents.find(c => c.child_id === log.child_id);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        Anonymous ID: {(child?.children as any)?.anonymous_id || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {log.activity_date} | Device: {log.device_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{log.hours_screen_time}h total</p>
                      <p className="text-sm text-muted-foreground">
                        {log.hours_educational}h edu / {log.hours_entertainment}h ent
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
