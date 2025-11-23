import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearcherData } from "@/hooks/useResearcherData";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

export default function ResearcherParticipants() {
  const { data, isLoading } = useResearcherData();

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
          {data?.consents.length || 0} participants
        </Badge>
      </div>

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
          {data?.consents.map((consent, index) => {
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
                      <div className="space-y-1 text-sm">
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
