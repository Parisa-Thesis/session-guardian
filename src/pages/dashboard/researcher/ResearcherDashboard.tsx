import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearcherData } from "@/hooks/useResearcherData";
import { Database, TrendingUp, Users, Download, BarChart3, Clock, Shield, BookOpen, Tv } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useResearcherData();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("خروج با موفقیت انجام شد");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Prepare chart data
  const deviceTypeData = data?.activityLogs.reduce((acc: any, log: any) => {
    const type = log.device_type;
    if (!acc[type]) acc[type] = 0;
    acc[type] += log.hours_screen_time;
    return acc;
  }, {});

  const deviceChartData = Object.entries(deviceTypeData || {}).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const screenTimeByDate = data?.activityLogs.reduce((acc: any, log: any) => {
    const date = log.activity_date;
    if (!acc[date]) {
      acc[date] = { date, screenTime: 0, educational: 0, entertainment: 0 };
    }
    acc[date].screenTime += log.hours_screen_time;
    acc[date].educational += log.hours_educational;
    acc[date].entertainment += log.hours_entertainment;
    return acc;
  }, {});

  const timeSeriesData = Object.values(screenTimeByDate || {})
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14);

  const exportData = () => {
    const csv = [
      ["Anonymous ID", "Date", "Device Type", "Screen Time (hours)", "Educational (hours)", "Entertainment (hours)"],
      ...data!.activityLogs.map(log => {
        const child = data!.consents.find(c => c.child_id === log.child_id);
        return [
          (child?.children as any)?.anonymous_id || "Unknown",
          log.activity_date,
          log.device_type,
          log.hours_screen_time,
          log.hours_educational,
          log.hours_entertainment,
        ];
      }),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Data exported successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Researcher Dashboard</h1>
              <p className="text-sm text-muted-foreground">Anonymized data analysis</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consented Children</p>
                  <p className="text-2xl font-bold text-foreground">{data?.stats.totalChildren}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Database className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-2xl font-bold text-foreground">{data?.stats.totalDataPoints}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Screen Time</p>
                  <p className="text-2xl font-bold text-foreground">{data?.stats.avgScreenTime}h</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activity Logs</p>
                  <p className="text-2xl font-bold text-foreground">{data?.activityLogs.length}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {data?.stats.totalChildren === 0 ? (
          <Card className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Consented Data</h3>
            <p className="text-muted-foreground">
              No parents have granted consent for data access yet.
            </p>
          </Card>
        ) : (
          <>
            {/* Charts */}
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList>
                <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
                <TabsTrigger value="devices">Device Distribution</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Screen Time Trends (Last 14 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="screenTime" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" />
                      <Line type="monotone" dataKey="educational" stroke="#22c55e" strokeWidth={2} name="Educational" />
                      <Line type="monotone" dataKey="entertainment" stroke="#f97316" strokeWidth={2} name="Entertainment" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="devices" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Screen Time by Device Type</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="participants" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Consented Participants</h3>
                    <Badge variant="outline">{data?.consents.length} participants</Badge>
                  </div>
                  <div className="space-y-3">
                    {data?.consents.map((consent, index) => (
                      <motion.div
                        key={consent.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            Participant ID: {(consent.children as any)?.anonymous_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Age Group: {(consent.children as any)?.age_group || "Not specified"}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          Consented
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Export */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Export Research Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download anonymized dataset for analysis (CSV format)
                  </p>
                </div>
                <Button onClick={exportData} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
