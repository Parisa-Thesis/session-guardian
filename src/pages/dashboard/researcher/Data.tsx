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
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [childFilter, setChildFilter] = useState<string>("all");

  // Get unique parents
  const uniqueParents = Array.from(new Set(data?.consents.map(c => (c.profiles as any)?.email).filter(Boolean))) || [];

  // Get children for selected parent
  const availableChildren = data?.consents.filter(consent => {
    if (parentFilter === "all") return true;
    return (consent.profiles as any)?.email === parentFilter;
  }) || [];

  // Get devices used by selected child from activity logs with counts
  const { data: childDevices } = useQuery({
    queryKey: ["child-devices", childFilter, data?.activityLogs],
    queryFn: async () => {
      if (childFilter === "all" || !data?.activityLogs) return [];
      
      // Get device types and count activities for each
      const childLogs = data.activityLogs.filter(log => log.child_id === childFilter);
      const deviceCounts = childLogs.reduce((acc, log) => {
        acc[log.device_type] = (acc[log.device_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(deviceCounts).map(([deviceType, count]) => ({
        device_type: deviceType,
        device_name: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
        activity_count: count,
      }));
    },
    enabled: childFilter !== "all" && !!data,
  });

  // Reset child filter when parent changes
  const handleParentChange = (value: string) => {
    setParentFilter(value);
    setChildFilter("all");
    setDeviceFilter("all");
  };

  // Reset device filter when child changes
  const handleChildChange = (value: string) => {
    setChildFilter(value);
    setDeviceFilter("all");
  };

  // Clear all filters
  const handleClearFilters = () => {
    setParentFilter("all");
    setChildFilter("all");
    setDeviceFilter("all");
    setSearchId("");
  };

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
    const consent = data?.consents.find(c => c.child_id === log.child_id);
    const anonymousId = (consent?.children as any)?.anonymous_id || "";
    const parentEmail = (consent?.profiles as any)?.email || "";
    
    const matchesDevice = deviceFilter === "all" || log.device_type === deviceFilter;
    const matchesSearch = !searchId || anonymousId.toLowerCase().includes(searchId.toLowerCase());
    const matchesParent = parentFilter === "all" || parentEmail === parentFilter;
    const matchesChild = childFilter === "all" || log.child_id === childFilter;
    
    return matchesDevice && matchesSearch && matchesParent && matchesChild;
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
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 flex flex-wrap items-center gap-3">
              <Select value={parentFilter} onValueChange={handleParentChange}>
                <SelectTrigger className="w-[220px] bg-background">
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Parents</SelectItem>
                  {uniqueParents.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={childFilter} 
                onValueChange={handleChildChange}
                disabled={parentFilter === "all"}
              >
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder={parentFilter === "all" ? "Select parent first" : "Select child"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Children</SelectItem>
                  {availableChildren.map((consent) => (
                    <SelectItem key={consent.child_id} value={consent.child_id}>
                      {(consent.children as any)?.name} (ID: {(consent.children as any)?.anonymous_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={deviceFilter} 
                onValueChange={setDeviceFilter}
                disabled={childFilter === "all"}
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder={childFilter === "all" ? "Select child first" : "Device type"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Devices</SelectItem>
                  {childDevices?.map((device) => (
                    <SelectItem key={device.device_type} value={device.device_type}>
                      {device.device_name} ({device.activity_count} activities)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Search by Anonymous ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="max-w-[200px] bg-background"
              />
              
              {(parentFilter !== "all" || childFilter !== "all" || deviceFilter !== "all" || searchId) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Clear All Filters
                </button>
              )}
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
