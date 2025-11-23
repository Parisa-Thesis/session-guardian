import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearcherData } from "@/hooks/useResearcherData";
import { TrendingUp, Smartphone, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useMemo } from "react";

const COLORS = {
  phone: "hsl(var(--chart-1))",
  tablet: "hsl(var(--chart-2))",
  laptop: "hsl(var(--chart-3))",
  tv: "hsl(var(--chart-4))",
  educational: "hsl(var(--chart-5))",
  entertainment: "hsl(var(--destructive))",
};

export default function ResearcherAnalytics() {
  const { data, isLoading } = useResearcherData();

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data?.activityLogs) return null;

    // Device usage distribution
    const deviceUsage = data.activityLogs.reduce((acc, log) => {
      const device = log.device_type;
      acc[device] = (acc[device] || 0) + log.hours_screen_time;
      return acc;
    }, {} as Record<string, number>);

    const deviceData = Object.entries(deviceUsage).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value * 10) / 10,
    }));

    // Daily screen time trend (last 14 days)
    const dailyData = data.activityLogs
      .reduce((acc, log) => {
        const date = log.activity_date;
        const existing = acc.find((d) => d.date === date);
        if (existing) {
          existing.total += log.hours_screen_time;
          existing.educational += log.hours_educational;
          existing.entertainment += log.hours_entertainment;
        } else {
          acc.push({
            date,
            total: log.hours_screen_time,
            educational: log.hours_educational,
            entertainment: log.hours_entertainment,
          });
        }
        return acc;
      }, [] as any[])
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    // Educational vs Entertainment
    const contentTypeData = data.activityLogs.reduce(
      (acc, log) => {
        acc.educational += log.hours_educational;
        acc.entertainment += log.hours_entertainment;
        return acc;
      },
      { educational: 0, entertainment: 0 }
    );

    const contentData = [
      { name: "Educational", value: Math.round(contentTypeData.educational * 10) / 10 },
      { name: "Entertainment", value: Math.round(contentTypeData.entertainment * 10) / 10 },
    ];

    // Average screen time by device
    const deviceAverages = Object.entries(deviceUsage).map(([name, total]) => {
      const count = data.activityLogs.filter((log) => log.device_type === name).length;
      return {
        device: name.charAt(0).toUpperCase() + name.slice(1),
        average: Math.round((total / count) * 10) / 10,
      };
    });

    // Weekly aggregate trends
    const weeklyData = data.aggregates.weekly
      .map((week) => ({
        week: `${week.week_start}`,
        total: Math.round((week.total_minutes / 60) * 10) / 10,
        phone: Math.round(((week.phone_minutes || 0) / 60) * 10) / 10,
        tablet: Math.round(((week.tablet_minutes || 0) / 60) * 10) / 10,
        laptop: Math.round(((week.laptop_minutes || 0) / 60) * 10) / 10,
        tv: Math.round(((week.tv_minutes || 0) / 60) * 10) / 10,
      }))
      .slice(-8);

    return {
      deviceData,
      dailyData,
      contentData,
      deviceAverages,
      weeklyData,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data || data.stats.totalChildren === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Data trends and behavioral insights</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            No parents have granted consent for data access yet.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Data trends and behavioral insights</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Total Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalDataPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">Activity logs collected</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Avg Screen Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.stats.avgScreenTime.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per day average</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalChildren}</div>
              <p className="text-xs text-muted-foreground mt-1">Active participants</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Edu Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chartData?.contentData[0]
                  ? Math.round(
                      (chartData.contentData[0].value /
                        (chartData.contentData[0].value + chartData.contentData[1].value)) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">Educational usage</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Screen Time Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Daily Screen Time Trend (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData?.dailyData || []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.phone} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.phone} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.phone}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Device Usage Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Device Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData?.deviceData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData?.deviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Educational vs Entertainment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Content Type Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData?.contentData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData?.contentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Educational"
                            ? COLORS.educational
                            : COLORS.entertainment
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Screen Time by Device */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Average Screen Time by Device</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData?.deviceAverages || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="device"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="average" fill={COLORS.tablet} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Weekly Screen Time by Device (Last 8 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData?.weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="week"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="phone"
                  stroke={COLORS.phone}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="tablet"
                  stroke={COLORS.tablet}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="laptop"
                  stroke={COLORS.laptop}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="tv"
                  stroke={COLORS.tv}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
