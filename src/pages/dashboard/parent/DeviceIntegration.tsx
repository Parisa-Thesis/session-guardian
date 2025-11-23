import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useParentData } from "@/hooks/useParentData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DeviceIntegration = () => {
  const { data } = useParentData();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const webhookUrl = `${baseUrl}/functions/v1/auto-session-tracker`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exampleRequest = (deviceId: string, childId: string, action: "start" | "stop") => {
    return JSON.stringify(
      {
        action: action,
        device_id: deviceId,
        child_id: childId,
      },
      null,
      2
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Device Integration</h1>
        <p className="text-muted-foreground">
          Set up automatic session tracking for tablets and mobile devices
        </p>
      </div>

      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertTitle>Automatic Session Tracking</AlertTitle>
        <AlertDescription>
          Configure your tablets to automatically start and stop screen time sessions when the
          device is used. This requires installing a companion app or custom integration.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="webhook">
        <TabsList>
          <TabsTrigger value="webhook">Webhook API</TabsTrigger>
          <TabsTrigger value="devices">My Devices</TabsTrigger>
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoint</CardTitle>
              <CardDescription>
                Use this endpoint to send automatic session events from your devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Endpoint URL</label>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 rounded-lg bg-muted text-sm font-mono break-all">
                    {webhookUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl, "webhook")}
                  >
                    {copiedId === "webhook" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Method</label>
                <Badge variant="secondary">POST</Badge>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Request Headers</label>
                <div className="space-y-2">
                  <code className="block p-3 rounded-lg bg-muted text-sm font-mono">
                    Content-Type: application/json
                  </code>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Actions</label>
                <div className="grid gap-2 md:grid-cols-3">
                  <Badge variant="outline">start - Begin session</Badge>
                  <Badge variant="outline">stop - End session</Badge>
                  <Badge variant="outline">heartbeat - Check status</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Devices</CardTitle>
              <CardDescription>Devices that can use automatic session tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {!data?.devices || data.devices.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No devices registered yet</p>
                  <Button variant="outline">Add Device</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.devices.map((device: any) => {
                    const child = data.children?.find((c: any) => c.id === device.child_id);
                    return (
                      <Card key={device.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {device.device_type} - {device.model || "Unknown"}
                              </h3>
                              <Badge variant="outline">{child?.name}</Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Device ID:</span>{" "}
                                <code className="bg-muted px-1 rounded">{device.id}</code>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Child ID:</span>{" "}
                                <code className="bg-muted px-1 rounded">{device.child_id}</code>
                              </p>
                            </div>
                            <details className="mt-2">
                              <summary className="text-sm text-primary cursor-pointer hover:underline">
                                Show example requests
                              </summary>
                              <div className="mt-2 space-y-2">
                                <div>
                                  <p className="text-xs font-medium mb-1">Start Session:</p>
                                  <pre className="text-xs p-2 bg-muted rounded overflow-x-auto">
                                    {exampleRequest(device.id, device.child_id, "start")}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs font-medium mb-1">Stop Session:</p>
                                  <pre className="text-xs p-2 bg-muted rounded overflow-x-auto">
                                    {exampleRequest(device.id, device.child_id, "stop")}
                                  </pre>
                                </div>
                              </div>
                            </details>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(
                                  { device_id: device.id, child_id: device.child_id },
                                  null,
                                  2
                                ),
                                device.id
                              )
                            }
                          >
                            {copiedId === device.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>How to set up automatic session tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">1. For iOS/iPadOS Devices</h3>
                <p className="text-sm text-muted-foreground">
                  Use iOS Shortcuts with Screen Time API to automatically send webhook requests when
                  the device is unlocked/locked.
                </p>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Download iOS Shortcut Template
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">2. For Android Devices</h3>
                <p className="text-sm text-muted-foreground">
                  Use Tasker or similar automation apps to trigger webhook calls on device
                  unlock/lock events.
                </p>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Download Tasker Configuration
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">3. Custom Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Build your own app or integration using the webhook API. Send POST requests to the
                  endpoint with device and child IDs.
                </p>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Example cURL command:</p>
                  <pre className="text-xs overflow-x-auto">
                    {`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "start",
    "device_id": "YOUR_DEVICE_ID",
    "child_id": "YOUR_CHILD_ID"
  }'`}
                  </pre>
                </div>
              </div>

              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertTitle>Need Help?</AlertTitle>
                <AlertDescription>
                  Contact support for assistance with device integration and custom setup
                  requirements.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceIntegration;
