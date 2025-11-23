import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ConsentManagement() {
  const { data: consents, isLoading } = useQuery({
    queryKey: ["all-consents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consents")
        .select(`
          *,
          children (name, anonymous_id, age_group),
          profiles!consents_parent_id_fkey (name, email),
          profiles!consents_researcher_id_fkey (name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 bg-background p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingConsents = consents?.filter(c => !c.granted) || [];
  const grantedConsents = consents?.filter(c => c.granted) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Consent Management</h1>
            <p className="text-muted-foreground mt-2">
              Overview of all consent requests in the system
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{pendingConsents.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Granted</p>
                  <p className="text-2xl font-bold text-foreground">{grantedConsents.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{consents?.length || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {pendingConsents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Pending Requests</h2>
              <div className="space-y-4">
                {pendingConsents.map((consent, index) => {
                  const parentProfile = consent.profiles as any;
                  const researcherQuery = supabase
                    .from("profiles")
                    .select("name, email")
                    .eq("id", consent.researcher_id)
                    .single();
                  
                  return (
                    <motion.div
                      key={consent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                Pending
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Requested {new Date(consent.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Researcher</p>
                                <p className="font-medium text-foreground text-sm">
                                  {parentProfile?.name || parentProfile?.email || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Parent</p>
                                <p className="font-medium text-foreground text-sm">
                                  {parentProfile?.name || parentProfile?.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Child</p>
                                <p className="font-medium text-foreground text-sm">
                                  {(consent.children as any)?.name} ({(consent.children as any)?.age_group})
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Anonymous ID</p>
                                <p className="font-mono text-xs text-foreground">
                                  {(consent.children as any)?.anonymous_id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {grantedConsents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Granted Consents</h2>
              <div className="space-y-4">
                {grantedConsents.map((consent, index) => {
                  const parentProfile = consent.profiles as any;
                  
                  return (
                    <motion.div
                      key={consent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Granted
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Granted on {consent.granted_at ? new Date(consent.granted_at).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Researcher</p>
                                <p className="font-medium text-foreground text-sm">
                                  {parentProfile?.name || parentProfile?.email || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Parent</p>
                                <p className="font-medium text-foreground text-sm">
                                  {parentProfile?.name || parentProfile?.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Child</p>
                                <p className="font-medium text-foreground text-sm">
                                  {(consent.children as any)?.name} ({(consent.children as any)?.age_group})
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Anonymous ID</p>
                                <p className="font-mono text-xs text-foreground">
                                  {(consent.children as any)?.anonymous_id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {(!consents || consents.length === 0) && (
            <Card className="p-12 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No Consents</h3>
              <p className="text-muted-foreground">
                No consent requests have been made in the system yet.
              </p>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}