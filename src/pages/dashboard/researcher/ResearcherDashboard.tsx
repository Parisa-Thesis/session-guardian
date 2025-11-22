import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Database, TrendingUp, Download } from "lucide-react";

const ResearcherDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Researcher Dashboard</h1>
          <p className="text-muted-foreground">Access aggregated research data and analytics</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-primary" />
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">1,247</div>
              <p className="text-sm text-muted-foreground">Active families</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
                Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">45.2K</div>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-accent" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">Available</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Research Data Access</CardTitle>
            <CardDescription>Export anonymized datasets for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Screen Time Patterns (2024)",
              "Device Usage Demographics",
              "Behavioral Insights Dataset",
              "Parental Control Effectiveness Study",
            ].map((dataset, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{dataset}</p>
                  <p className="text-sm text-muted-foreground">Anonymized • IRB Approved</p>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
