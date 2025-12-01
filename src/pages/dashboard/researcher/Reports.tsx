import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWeeklyReport } from "@/hooks/useWeeklyReport";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMinutesToTime } from "@/lib/timeUtils";

export default function ResearcherReports() {
    const [selectedParentId, setSelectedParentId] = useState<string>("");

    // Fetch consented parents
    const { data: consentedParents } = useQuery({
        queryKey: ["consented-parents"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data } = await supabase
                .from("consent_requests")
                .select("parent_id, profiles:parent_id(name, email)")
                .eq("researcher_id", user.id)
                .eq("status", "approved");

            // Deduplicate parents
            const uniqueParents = new Map();
            data?.forEach((item: any) => {
                if (!uniqueParents.has(item.parent_id)) {
                    uniqueParents.set(item.parent_id, item.profiles);
                }
            });

            return Array.from(uniqueParents.entries()).map(([id, profile]) => ({
                id,
                ...profile
            }));
        }
    });

    const { reports, isLoading } = useWeeklyReport(selectedParentId);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Participant Reports</h2>
                <p className="text-muted-foreground">View weekly reports for consented participants.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Participant</CardTitle>
                    <CardDescription>Choose a parent to view their weekly reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select parent" />
                        </SelectTrigger>
                        <SelectContent>
                            {consentedParents?.map((parent: any) => (
                                <SelectItem key={parent.id} value={parent.id}>
                                    {parent.name || parent.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedParentId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p>Loading reports...</p>
                        ) : (
                            <div className="space-y-4">
                                {reports?.map((report: any) => (
                                    <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Week ending {format(new Date(report.report_date), "MMM d, yyyy")}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="mr-4">Total Screen Time: {formatMinutesToTime(report.summary_json?.total_screen_time || 0)}</span>
                                                    <span className="mr-4">Edu: {formatMinutesToTime(report.summary_json?.educational_minutes || 0)}</span>
                                                    <span>Bonus: {report.summary_json?.bonus_minutes_earned || 0}m</span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                                {(!reports || reports.length === 0) && (
                                    <p className="text-center text-muted-foreground py-8">
                                        No reports found for this participant.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
