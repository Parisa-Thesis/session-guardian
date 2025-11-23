import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, Check, ExternalLink, Tablet, Clock, Info, AlertCircle, CheckCircle, Code } from "lucide-react";
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

        <TabsContent value="guide" className="space-y-6">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertTitle>ردیابی خودکار زمان استفاده از صفحه نمایش</AlertTitle>
            <AlertDescription>
              وقتی فرزند شما تبلت را روشن می‌کند، به صورت خودکار زمان استفاده ثبت می‌شود - حتی بدون باز کردن این برنامه
            </AlertDescription>
          </Alert>

          {/* iOS Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                راه‌اندازی iOS (آیفون/آیپد)
              </CardTitle>
              <CardDescription>
                استفاده از Shortcuts برای ردیابی خودکار
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>چگونه کار می‌کند؟</AlertTitle>
                <AlertDescription>
                  وقتی فرزندتان تبلت را روشن می‌کند یا هر برنامه‌ای را باز می‌کند، به صورت خودکار یک پیام به سیستم ما ارسال می‌شود و زمان استفاده شروع می‌شود. شما به صورت لحظه‌ای اطلاع‌رسانی دریافت می‌کنید.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">مرحله 1: نصب Shortcuts</h4>
                <p className="text-sm text-muted-foreground">
                  برنامه Shortcuts را روی دستگاه iOS فرزندتان باز کنید (از iOS 13 به بعد نصب شده است)
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">مرحله 2: ایجاد اتوماسیون شروع</h4>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>به تب Automation بروید → Create Personal Automation</li>
                  <li>گزینه "Time of Day" را انتخاب کنید</li>
                  <li>زمان را روی هر 5 دقیقه تنظیم کنید (برای ردیابی مداوم)</li>
                  <li>یا گزینه "App" → "Is Opened" → "Any App" را انتخاب کنید</li>
                  <li>Action اضافه کنید: "Get Contents of URL"</li>
                  <li>URL را تنظیم کنید: <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">{webhookUrl}</code></li>
                  <li>Method را روی POST تنظیم کنید</li>
                  <li>Request Body را از پایین کپی کنید</li>
                </ol>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-2">Request Body (برای شروع):</p>
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
                <h4 className="font-medium">مرحله 3: ایجاد اتوماسیون توقف</h4>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>یک automation دیگر بسازید با "App" → "Is Closed"</li>
                  <li>یا "Screen locks" (وقتی صفحه قفل می‌شود)</li>
                  <li>از همان URL استفاده کنید با action "stop"</li>
                </ol>
              </div>

              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>نتیجه</AlertTitle>
                <AlertDescription>
                  حالا هر بار که فرزندتان دستگاه را استفاده کند، شما فوراً اطلاع‌رسانی دریافت می‌کنید: "فعالیت صفحه نمایش [نام فرزند] در حال ثبت است"
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Android Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tablet className="h-5 w-5" />
                راه‌اندازی اندروید
              </CardTitle>
              <CardDescription>
                استفاده از Tasker برای ردیابی خودکار
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>چگونه کار می‌کند؟</AlertTitle>
                <AlertDescription>
                  با Tasker می‌توانید تبلت اندروید را طوری تنظیم کنید که وقتی صفحه روشن می‌شود، به صورت خودکار به سیستم ما اطلاع دهد و زمان استفاده را ثبت کند.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">مرحله 1: نصب Tasker</h4>
                <p className="text-sm text-muted-foreground">
                  Tasker را از Google Play Store دانلود کنید (برنامه پولی، حدود $3.49)
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">مرحله 2: ایجاد Profile برای روشن شدن صفحه</h4>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>Profile جدید بسازید → Event → Display → Display On</li>
                  <li>Task جدید بسازید → Net → HTTP Request</li>
                  <li>URL را روی webhook URL بالا تنظیم کنید</li>
                  <li>Method: POST</li>
                  <li>Body را از پایین کپی کنید</li>
                </ol>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-2">Request Body:</p>
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
                <h4 className="font-medium">مرحله 3: ایجاد Profile برای خاموش شدن صفحه</h4>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                  <li>Profile → Event → Display → Display Off</li>
                  <li>Task با HTTP Request با action "stop"</li>
                </ol>
              </div>

              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>نتیجه</AlertTitle>
                <AlertDescription>
                  حالا هر بار که تبلت روشن یا خاموش می‌شود، به صورت خودکار به شما اطلاع داده می‌شود و زمان دقیق استفاده ثبت می‌شود.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Alternative: Screen Time Apps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                راه حل آسان‌تر: اپلیکیشن‌های Screen Time
              </CardTitle>
              <CardDescription>
                استفاده از اپلیکیشن‌های آماده برای ردیابی خودکار
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                اگر راه‌اندازی دستی پیچیده است، می‌توانید از اپلیکیشن‌های آماده استفاده کنید که با API ما کار می‌کنند:
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-1">برای iOS</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Screen Time (داخلی iOS) + Shortcuts</li>
                    <li>• OurPact - ردیابی و کنترل والدین</li>
                    <li>• Qustodio - پلتفرم کامل والدین</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-1">برای اندروید</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Digital Wellbeing (داخلی Android)</li>
                    <li>• Family Link - برنامه رسمی Google</li>
                    <li>• Kids Place - قفل والدین</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                چطور کار می‌کند؟
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">فرزند تبلت را روشن می‌کند</p>
                  <p className="text-sm text-muted-foreground">صفحه دستگاه روشن می‌شود</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">ارسال خودکار به سیستم</p>
                  <p className="text-sm text-muted-foreground">دستگاه به صورت خودکار به API ما اطلاع می‌دهد</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">شروع ثبت زمان</p>
                  <p className="text-sm text-muted-foreground">تایمر شروع می‌شود و در دیتابیس ذخیره می‌شود</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium">اطلاع‌رسانی فوری به شما</p>
                  <p className="text-sm text-muted-foreground">نوتیفیکیشن دریافت می‌کنید: "فعالیت صفحه نمایش [نام] در حال ثبت است ⏱️"</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>نیاز به کمک دارید؟</AlertTitle>
            <AlertDescription>
              اگر در راه‌اندازی ردیابی خودکار به کمک نیاز دارید، لطفاً با پشتیبانی تماس بگیرید.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceIntegration;
