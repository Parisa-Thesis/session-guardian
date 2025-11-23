import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearcherData } from "@/hooks/useResearcherData";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ResearcherAnalytics() {
  const { data, isLoading } = useResearcherData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Visual analysis of research data</p>
        </div>
      </div>

      {data?.stats.totalChildren === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            No parents have granted consent for data access yet.
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Screen Time Trends (Last 14 Days)</h3>
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

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Screen Time by Device Type</h3>
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
        </>
      )}
    </div>
  );
}
