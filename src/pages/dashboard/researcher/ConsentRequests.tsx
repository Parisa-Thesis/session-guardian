import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Send, CheckCircle, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function ConsentRequests() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [dataScope, setDataScope] = useState({
    summary: true,
    activityLogs: false,
    sessions: false,
    location: false,
    devices: false,
  });
  const [researchPurpose, setResearchPurpose] = useState("");

  // Fetch all parents and their children
  const { data: parents, isLoading: parentsLoading } = useQuery({
    queryKey: ["parents-children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email
        `)
        .eq("role", "parent");

      if (error) {
        console.error("Error fetching parents:", error);
        throw error;
      }
      return data;
    },
  });

  // Fetch children for selected parent
  const { data: children } = useQuery({
    queryKey: ["parent-children", selectedParent],
    queryFn: async () => {
      if (!selectedParent) return [];
      
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", selectedParent);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedParent,
  });

  // Fetch my consent requests
  const { data: consents, isLoading } = useQuery({
    queryKey: ["my-consent-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("consents")
        .select(`
          *,
          children (name, anonymous_id, age_group),
          profiles!consents_parent_id_fkey (name, email)
        `)
        .eq("researcher_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const requestConsentMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!selectedParent || !selectedChild) {
        throw new Error("Please select both parent and child");
      }

      if (!hasAnyDataScope) {
        throw new Error("Please select at least one type of data to request");
      }

      if (!researchPurpose.trim()) {
        throw new Error("Please describe the research purpose");
      }

      // Check if request already exists
      const { data: existing, error: existingError } = await supabase
        .from("consents")
        .select("id")
        .eq("researcher_id", user.id)
        .eq("parent_id", selectedParent)
        .eq("child_id", selectedChild)
        .maybeSingle();

      if (existingError && (existingError as any).code !== "PGRST116") {
        throw existingError;
      }

      if (existing) {
        throw new Error("Consent request already exists for this child");
      }

      const { error } = await supabase.from("consents").insert({
        researcher_id: user.id,
        parent_id: selectedParent,
        child_id: selectedChild,
        granted: false,
        data_scope_summary: dataScope.summary,
        data_scope_activity_logs: dataScope.activityLogs,
        data_scope_sessions: dataScope.sessions,
        data_scope_location: dataScope.location,
        data_scope_devices: dataScope.devices,
        research_purpose: researchPurpose.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-consent-requests"] });
      toast.success("Consent request sent successfully");
      setDialogOpen(false);
      setSelectedParent("");
      setSelectedChild("");
      setDataScope({
        summary: true,
        activityLogs: false,
        sessions: false,
        location: false,
        devices: false,
      });
      setResearchPurpose("");
    },
    onError: (error: any) => {
      toast.error("Failed to send request: " + error.message);
    },
  });

  const hasAnyDataScope =
    dataScope.summary ||
    dataScope.activityLogs ||
    dataScope.sessions ||
    dataScope.location ||
    dataScope.devices;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const pendingRequests = consents?.filter(c => !c.granted) || [];
  const grantedRequests = consents?.filter(c => c.granted) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Consent Requests</h1>
          <p className="text-muted-foreground mt-2">
            Request access to participants' data for research purposes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Request Consent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Data Access Consent</DialogTitle>
              <DialogDescription>
                Send a consent request to a parent to access their child's anonymized data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Parent</Label>
                <Select value={selectedParent} onValueChange={setSelectedParent} disabled={parentsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={parentsLoading ? "Loading parents..." : parents?.length === 0 ? "No parents found" : "Choose a parent"} />
                  </SelectTrigger>
                  <SelectContent>
                    {parents?.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name || parent.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedParent && (
                <div>
                  <Label>Select Child</Label>
                  <Select
                    value={selectedChild}
                    onValueChange={setSelectedChild}
                    disabled={!children}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !children
                            ? "Loading children..."
                            : children.length === 0
                            ? "No children found for this parent"
                            : "Choose a child"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {children?.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} ({child.age_group})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {children && children.length === 0 && (
                    <p className="mt-1 text-xs text-destructive">
                      This parent has no registered children yet.
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={() => requestConsentMutation.mutate()}
                disabled={!selectedParent || !selectedChild || requestConsentMutation.isPending}
                className="w-full"
              >
                {requestConsentMutation.isPending ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
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
              <p className="text-2xl font-bold text-foreground">{grantedRequests.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold text-foreground">{consents?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Pending Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((consent, index) => (
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
                          Sent {new Date(consent.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          Parent: {(consent.profiles as any)?.name || (consent.profiles as any)?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Child: {(consent.children as any)?.name} (Age: {(consent.children as any)?.age_group})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Anonymous ID: {(consent.children as any)?.anonymous_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {grantedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Granted Consents</h2>
          <div className="space-y-4">
            {grantedRequests.map((consent, index) => (
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
                          Parent: {(consent.profiles as any)?.name || (consent.profiles as any)?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Child: {(consent.children as any)?.name} (Age: {(consent.children as any)?.age_group})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Anonymous ID: {(consent.children as any)?.anonymous_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(!consents || consents.length === 0) && (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Consent Requests</h3>
          <p className="text-muted-foreground">
            You haven't sent any consent requests yet. Click "Request Consent" to get started.
          </p>
        </Card>
      )}
    </div>
  );
}