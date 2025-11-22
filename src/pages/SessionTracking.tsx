import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const SessionTracking = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Session Tracking</CardTitle>
          <CardDescription>Monitor active screen time sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This feature allows real-time tracking of device sessions. Integration with device monitoring APIs required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionTracking;
