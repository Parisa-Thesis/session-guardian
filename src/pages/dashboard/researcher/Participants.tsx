import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearcherData } from "@/hooks/useResearcherData";
import { Users, Filter, CheckCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResearcherParticipants() {
  const { data, isLoading } = useResearcherData();
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [childFilter, setChildFilter] = useState<string>("");
  const [ageFilter, setAgeFilter] = useState<string>("all");

  const filteredConsents = data?.consents.filter(consent => {
    const parentEmail = (consent.profiles as any)?.email || "";
    const parentName = (consent.profiles as any)?.name || "";
    const childName = (consent.children as any)?.name || "";
    const anonymousId = (consent.children as any)?.anonymous_id || "";
    const ageGroup = (consent.children as any)?.age_group || "";

    const matchesParent = parentFilter === "all" || parentEmail === parentFilter;
    const matchesChild = !childFilter ||
      childName.toLowerCase().includes(childFilter.toLowerCase()) ||
      anonymousId.toLowerCase().includes(childFilter.toLowerCase());
    const matchesAge = ageFilter === "all" || ageGroup === ageFilter;

    return matchesParent && matchesChild && matchesAge;
  }) || [];

  const uniqueParents = Array.from(new Set(data?.consents.map(c => (c.profiles as any)?.email).filter(Boolean))) || [];
  const ageGroups = ["0-2", "3-5", "6-8", "9-11", "12-14", "15-17", "18+"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Participants</h1>
            <p className="text-muted-foreground">Consented participants in research study</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredConsents.length} / {data?.consents.length || 0} participants
        </Badge>
      </div>

      {data?.consents && data.consents.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 flex gap-4 flex-wrap">
              <Select value={parentFilter} onValueChange={setParentFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parents</SelectItem>
                  {uniqueParents.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  {ageGroups.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search by child name or ID..."
                value={childFilter}
                onChange={(e) => setChildFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>
        </Card>
      )}

      {data?.stats.totalChildren === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
          <p className="text-muted-foreground">
            No parents have granted consent for data access yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredConsents.map((consent, index) => {
            const childData = consent.children as any;
            const activityCount = data?.activityLogs.filter(
              log => log.child_id === consent.child_id
            ).length || 0;

            return (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          Participant #{index + 1}
                        </h3>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          Consented
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Child Name:</span>{" "}
                          <span className="font-medium">{childData?.name || "Unknown"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Anonymous ID:</span>{" "}
                          <span className="font-mono">{childData?.anonymous_id || "Unknown"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Age Group:</span>{" "}
                          <span className="font-medium">{childData?.age_group || "Not specified"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Consent Date:</span>{" "}
                          <span>{new Date(consent.granted_at || consent.created_at).toLocaleDateString()}</span>
                        </p>
                        <div className="pt-2 space-y-1">
                          <p className="text-xs font-medium text-green-700 dark:text-green-400">Data Access:</p>
                          <div className="flex flex-wrap gap-1">
                            {consent.data_scope_summary && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Stats
                              </Badge>
                            )}
                            {consent.data_scope_activity_logs && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activity Logs
                              </Badge>
                            )}
                            {consent.data_scope_sessions && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Sessions
                              </Badge>
                            )}
                            {consent.data_scope_location && (
                              <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Location
                              </Badge>
                            )}
                            {consent.data_scope_devices && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Devices
                              </Badge>
                            )}
                          </div>
                          {consent.data_scope_location && (
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.location.href = `/dashboard/researcher/participants/${consent.child_id}/location`}
                              >
                                <MapPin className="h-4 w-4" />
                                View Location History
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{activityCount}</p>
                      <p className="text-sm text-muted-foreground">activity logs</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
