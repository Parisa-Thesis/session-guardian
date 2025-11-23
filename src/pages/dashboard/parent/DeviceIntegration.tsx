import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, Check, Tablet, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useParentData } from "@/hooks/useParentData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

const DeviceIntegration = () => {
  const { t } = useTranslation();
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
        <h1 className="text-4xl font-bold">{t('deviceIntegration.title')}</h1>
        <p className="text-muted-foreground">
          {t('deviceIntegration.subtitle')}
        </p>
      </div>

      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertTitle>{t('deviceIntegration.autoTracking')}</AlertTitle>
        <AlertDescription>
          {t('deviceIntegration.autoTrackingDesc')}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="webhook">
        <TabsList>
          <TabsTrigger value="webhook">{t('deviceIntegration.webhookApi')}</TabsTrigger>
          <TabsTrigger value="devices">{t('deviceIntegration.myDevices')}</TabsTrigger>
          <TabsTrigger value="guide">{t('deviceIntegration.setupGuide')}</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('deviceIntegration.webhookEndpoint')}</CardTitle>
              <CardDescription>
                {t('deviceIntegration.webhookDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('deviceIntegration.endpointUrl')}</label>
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
                <label className="text-sm font-medium mb-2 block">{t('deviceIntegration.method')}</label>
                <Badge variant="secondary">POST</Badge>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('deviceIntegration.requestHeaders')}</label>
                <div className="space-y-2">
                  <code className="block p-3 rounded-lg bg-muted text-sm font-mono">
                    Content-Type: application/json
                  </code>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('deviceIntegration.actions')}</label>
                <div className="grid gap-2 md:grid-cols-3">
                  <Badge variant="outline">{t('deviceIntegration.startSession')}</Badge>
                  <Badge variant="outline">{t('deviceIntegration.stopSession')}</Badge>
                  <Badge variant="outline">{t('deviceIntegration.heartbeat')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('deviceIntegration.registeredDevices')}</CardTitle>
              <CardDescription>{t('deviceIntegration.registeredDevicesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {!data?.devices || data.devices.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">{t('deviceIntegration.noDevicesYet')}</p>
                  <Button variant="outline">{t('deviceIntegration.addDevice')}</Button>
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
                                <span className="font-medium">{t('deviceIntegration.deviceId')}:</span>{" "}
                                <code className="bg-muted px-1 rounded">{device.id}</code>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">{t('deviceIntegration.childId')}:</span>{" "}
                                <code className="bg-muted px-1 rounded">{device.child_id}</code>
                              </p>
                            </div>
                            <details className="mt-2">
                              <summary className="text-sm text-primary cursor-pointer hover:underline">
                                {t('deviceIntegration.showExamples')}
                              </summary>
                              <div className="mt-2 space-y-2">
                                <div>
                                  <p className="text-xs font-medium mb-1">{t('deviceIntegration.startSessionExample')}</p>
                                  <pre className="text-xs p-2 bg-muted rounded overflow-x-auto">
                                    {exampleRequest(device.id, device.child_id, "start")}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs font-medium mb-1">{t('deviceIntegration.stopSessionExample')}</p>
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

        <TabsContent value="guide" className="space-y-6">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertTitle>{t('deviceIntegration.autoTracking')}</AlertTitle>
            <AlertDescription>
              {t('deviceIntegration.autoTrackingDesc')}
            </AlertDescription>
          </Alert>

          {/* iOS Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('deviceIntegration.iosSetup')}
              </CardTitle>
              <CardDescription>
                {t('deviceIntegration.iosSetupDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>{t('deviceIntegration.howItWorks')}</AlertTitle>
                <AlertDescription>
                  {t('deviceIntegration.howItWorksDesc')}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">{t('deviceIntegration.step1')} {t('deviceIntegration.iosStep1Title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('deviceIntegration.iosStep1Desc')}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{t('deviceIntegration.step2')} {t('deviceIntegration.iosStep2Title')}</h4>
                <p className="text-sm text-muted-foreground mb-2">{t('deviceIntegration.iosStep2Desc')}</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>{t('deviceIntegration.iosStep2Option1')}</li>
                  <li>{t('deviceIntegration.iosStep2Option2')}</li>
                  <li>{t('deviceIntegration.iosStep2Option3')}</li>
                  <li>{t('deviceIntegration.iosStep2Option4')}</li>
                  <li>{t('deviceIntegration.iosStep2Option5')} <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">{webhookUrl}</code></li>
                  <li>{t('deviceIntegration.iosStep2Option6')}</li>
                  <li>{t('deviceIntegration.iosStep2Option7')}</li>
                </ol>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-2">{t('deviceIntegration.requestBody')} ({t('deviceIntegration.startSessionExample')})</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "action": "start",
  "device_id": "DEVICE_ID_HERE",
  "child_id": "CHILD_ID_HERE"
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{t('deviceIntegration.step3')} {t('deviceIntegration.iosStep3Title')}</h4>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>{t('deviceIntegration.iosStep3Option1')}</li>
                  <li>{t('deviceIntegration.iosStep3Option2')}</li>
                  <li>{t('deviceIntegration.iosStep3Option3')}</li>
                </ol>
              </div>

              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>{t('deviceIntegration.result')}</AlertTitle>
                <AlertDescription>
                  {t('deviceIntegration.resultDesc')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Android Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tablet className="h-5 w-5" />
                {t('deviceIntegration.androidSetup')}
              </CardTitle>
              <CardDescription>
                {t('deviceIntegration.androidSetupDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>{t('deviceIntegration.howItWorks')}</AlertTitle>
                <AlertDescription>
                  {t('deviceIntegration.howItWorksDesc')}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">{t('deviceIntegration.step1')} {t('deviceIntegration.androidStep1Title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('deviceIntegration.androidStep1Desc')}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{t('deviceIntegration.step2')} {t('deviceIntegration.androidStep2Title')}</h4>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>{t('deviceIntegration.androidStep2Option1')}</li>
                  <li>{t('deviceIntegration.androidStep2Option2')}</li>
                  <li>{t('deviceIntegration.androidStep2Option3')}</li>
                  <li>{t('deviceIntegration.androidStep2Option4')}</li>
                  <li>{t('deviceIntegration.androidStep2Option5')}</li>
                </ol>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-2">{t('deviceIntegration.requestBody')}:</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "action": "start",
  "device_id": "DEVICE_ID_HERE",
  "child_id": "CHILD_ID_HERE"
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{t('deviceIntegration.step3')} {t('deviceIntegration.androidStep3Title')}</h4>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>{t('deviceIntegration.androidStep3Option1')}</li>
                  <li>{t('deviceIntegration.androidStep3Option2')}</li>
                </ol>
              </div>

              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>{t('deviceIntegration.result')}</AlertTitle>
                <AlertDescription>
                  {t('deviceIntegration.resultDesc')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Alternative: Screen Time Apps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('deviceIntegration.alternativeTitle')}
              </CardTitle>
              <CardDescription>
                {t('deviceIntegration.alternativeDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('deviceIntegration.alternativeText')}
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-1">{t('deviceIntegration.forIOS')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('deviceIntegration.iosOption1')}</li>
                    <li>• {t('deviceIntegration.iosOption2')}</li>
                    <li>• {t('deviceIntegration.iosOption3')}</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-1">{t('deviceIntegration.forAndroid')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('deviceIntegration.androidOption1')}</li>
                    <li>• {t('deviceIntegration.androidOption2')}</li>
                    <li>• {t('deviceIntegration.androidOption3')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('deviceIntegration.needHelp')}</AlertTitle>
            <AlertDescription>
              {t('deviceIntegration.contactSupport')}
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceIntegration;
