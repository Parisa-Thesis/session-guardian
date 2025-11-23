import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function Consents() {
  const queryClient = useQueryClient();
  const [selectedConsent, setSelectedConsent] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"grant" | "revoke" | null>(null);

  const { data: consents, isLoading } = useQuery({
    queryKey: ["consents"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("consents")
        .select(`
          *,
          children (name, anonymous_id),
          profiles!consents_researcher_id_fkey (name, email)
        `)
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const grantConsentMutation = useMutation({
    mutationFn: async (consentId: string) => {
      const { error } = await supabase
        .from("consents")
        .update({ granted: true, granted_at: new Date().toISOString() })
        .eq("id", consentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      toast.success("Consent granted successfully");
      setSelectedConsent(null);
      setActionType(null);
    },
    onError: (error) => {
      toast.error("Failed to grant consent: " + error.message);
    },
  });

  const revokeConsentMutation = useMutation({
    mutationFn: async (consentId: string) => {
      const { error } = await supabase
        .from("consents")
        .update({ granted: false, granted_at: null })
        .eq("id", consentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      toast.success("Consent revoked successfully");
      setSelectedConsent(null);
      setActionType(null);
    },
    onError: (error) => {
      toast.error("Failed to revoke consent: " + error.message);
    },
  });

  const handleAction = () => {
    if (!selectedConsent || !actionType) return;
    
    if (actionType === "grant") {
      grantConsentMutation.mutate(selectedConsent);
    } else {
      revokeConsentMutation.mutate(selectedConsent);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const pendingConsents = consents?.filter(c => !c.granted) || [];
  const grantedConsents = consents?.filter(c => c.granted) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Consent Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage researcher access to your children's screen time data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
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
              <p className="text-sm text-muted-foreground">Granted Access</p>
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
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold text-foreground">{consents?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {pendingConsents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Pending Consent Requests</h2>
          <div className="space-y-4">
            {pendingConsents.map((consent, index) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Pending
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(consent.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          Researcher: {(consent.profiles as any)?.name || (consent.profiles as any)?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Child: {(consent.children as any)?.name} (ID: {(consent.children as any)?.anonymous_id})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Data requested: {([
                            consent.data_scope_summary && "Aggregated stats",
                            consent.data_scope_activity_logs && "Detailed daily logs",
                            consent.data_scope_sessions && "Session-level data",
                            consent.data_scope_location && "Approximate location",
                            consent.data_scope_devices && "Device information",
                          ].filter(Boolean) as string[]).join(", ")}
                        </p>
                        {consent.research_purpose && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Purpose: {consent.research_purpose}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedConsent(consent.id);
                          setActionType("grant");
                        }}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Grant Access
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {grantedConsents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Granted Consents</h2>
          <div className="space-y-4">
            {grantedConsents.map((consent, index) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Granted
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Granted on {consent.granted_at ? new Date(consent.granted_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          Researcher: {(consent.profiles as any)?.name || (consent.profiles as any)?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Child: {(consent.children as any)?.name} (ID: {(consent.children as any)?.anonymous_id})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Data granted: {([
                            consent.data_scope_summary && "Aggregated stats",
                            consent.data_scope_activity_logs && "Detailed daily logs",
                            consent.data_scope_sessions && "Session-level data",
                            consent.data_scope_location && "Approximate location",
                            consent.data_scope_devices && "Device information",
                          ].filter(Boolean) as string[]).join(", ")}
                        </p>
                        {consent.research_purpose && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Purpose: {consent.research_purpose}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedConsent(consent.id);
                        setActionType("revoke");
                      }}
                      size="sm"
                      variant="destructive"
                    >
                      Revoke Access
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!consents || consents.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Consent Requests</h3>
          <p className="text-muted-foreground">
            You haven't received any data access requests from researchers yet.
          </p>
        </Card>
      )}

      <AlertDialog open={!!selectedConsent && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedConsent(null);
          setActionType(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "grant" ? "Grant Data Access?" : "Revoke Data Access?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "grant" 
                ? "This will allow the researcher to access your child's anonymized screen time data for research purposes. You can revoke access at any time."
                : "This will immediately revoke the researcher's access to your child's data. This action can be reversed by granting access again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {actionType === "grant" ? "Grant Access" : "Revoke Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
