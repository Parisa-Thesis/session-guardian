import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useResearcherData } from "@/hooks/useResearcherData";
import { TrendingUp, Smartphone, Clock, Activity, Calendar, Users2, Filter, FileText, Download, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subDays, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { formatMinutesToTime, formatHoursToTime } from "@/lib/timeUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Date range state
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [childFilter, setChildFilter] = useState<string>("");
  const [selectedDailyDate, setSelectedDailyDate] = useState<Date>(new Date());
  
  const uniqueParents = Array.from(new Set(data?.consents.map(c => (c.profiles as any)?.email).filter(Boolean))) || [];
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Quick date range shortcuts
  const setQuickRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
    setShowDatePicker(false);
  };

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data?.activityLogs) return null;

    // Filter by date range, parent, and child
    const filteredLogs = data.activityLogs.filter((log) => {
      const consent = data.consents.find(c => c.child_id === log.child_id);
      const parentEmail = (consent?.profiles as any)?.email || "";
      const childName = (consent?.children as any)?.name || "";
      const anonymousId = (consent?.children as any)?.anonymous_id || "";
      
      const inDateRange = isWithinInterval(new Date(log.activity_date), {
        start: dateRange.from,
        end: dateRange.to,
      });
      const matchesParent = parentFilter === "all" || parentEmail === parentFilter;
      const matchesChild = !childFilter || 
        childName.toLowerCase().includes(childFilter.toLowerCase()) ||
        anonymousId.toLowerCase().includes(childFilter.toLowerCase());
      
      return inDateRange && matchesParent && matchesChild;
    });

    // Device usage distribution
    const deviceUsage = filteredLogs.reduce((acc, log) => {
      const device = log.device_type;
      acc[device] = (acc[device] || 0) + log.hours_screen_time;
      return acc;
    }, {} as Record<string, number>);

    const deviceData = Object.entries(deviceUsage).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value * 10) / 10,
    }));

    // Daily screen time trend
    const dailyData = filteredLogs
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
      .sort((a, b) => a.date.localeCompare(b.date));

    // Educational vs Entertainment
    const contentTypeData = filteredLogs.reduce(
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
      const count = filteredLogs.filter((log) => log.device_type === name).length;
      return {
        device: name.charAt(0).toUpperCase() + name.slice(1),
        average: Math.round((total / count) * 10) / 10,
      };
    });

    // Age group analysis
    const ageGroupData = data.consents.reduce((acc, consent) => {
      const child = consent.children as any;
      const ageGroup = child?.age_group || "unknown";
      
      const childLogs = filteredLogs.filter((log) => log.child_id === consent.child_id);
      const totalTime = childLogs.reduce((sum, log) => sum + log.hours_screen_time, 0);
      const eduTime = childLogs.reduce((sum, log) => sum + log.hours_educational, 0);
      const entTime = childLogs.reduce((sum, log) => sum + log.hours_entertainment, 0);
      
      if (!acc[ageGroup]) {
        acc[ageGroup] = {
          ageGroup,
          totalTime: 0,
          educationalTime: 0,
          entertainmentTime: 0,
          participants: 0,
          avgDaily: 0,
        };
      }
      
      acc[ageGroup].totalTime += totalTime;
      acc[ageGroup].educationalTime += eduTime;
      acc[ageGroup].entertainmentTime += entTime;
      acc[ageGroup].participants += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const ageGroupChartData = Object.values(ageGroupData).map((group: any) => ({
      ageGroup: group.ageGroup,
      avgScreenTime: Math.round((group.totalTime / group.participants) * 10) / 10,
      avgEducational: Math.round((group.educationalTime / group.participants) * 10) / 10,
      avgEntertainment: Math.round((group.entertainmentTime / group.participants) * 10) / 10,
      participants: group.participants,
    }));

    // Device preference by age group
    const ageDeviceData = data.consents.map((consent) => {
      const child = consent.children as any;
      const ageGroup = child?.age_group || "unknown";
      const childLogs = filteredLogs.filter((log) => log.child_id === consent.child_id);
      
      const deviceTotals = childLogs.reduce((acc, log) => {
        acc[log.device_type] = (acc[log.device_type] || 0) + log.hours_screen_time;
        return acc;
      }, {} as Record<string, number>);

      return {
        ageGroup,
        phone: deviceTotals.phone || 0,
        tablet: deviceTotals.tablet || 0,
        laptop: deviceTotals.laptop || 0,
        tv: deviceTotals.tv || 0,
      };
    }).reduce((acc, curr) => {
      const existing = acc.find((item) => item.ageGroup === curr.ageGroup);
      if (existing) {
        existing.phone += curr.phone;
        existing.tablet += curr.tablet;
        existing.laptop += curr.laptop;
        existing.tv += curr.tv;
        existing.count += 1;
      } else {
        acc.push({ ...curr, count: 1 });
      }
      return acc;
    }, [] as any[]).map((item) => ({
      ageGroup: item.ageGroup,
      phone: Math.round((item.phone / item.count) * 10) / 10,
      tablet: Math.round((item.tablet / item.count) * 10) / 10,
      laptop: Math.round((item.laptop / item.count) * 10) / 10,
      tv: Math.round((item.tv / item.count) * 10) / 10,
    }));

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
      ageGroupChartData,
      ageDeviceData,
      totalDataPoints: filteredLogs.length,
    };
  }, [data, dateRange, parentFilter, childFilter]);

  // Fetch daily sessions for selected date
  const { data: dailySessions } = useQuery({
    queryKey: ["researcher-daily-sessions", format(selectedDailyDate, "yyyy-MM-dd"), data?.consents],
    queryFn: async () => {
      if (!data?.consents || data.consents.length === 0) return [];

      const selectedDateStr = format(selectedDailyDate, "yyyy-MM-dd");
      const grantedChildIds = data.consents.filter(c => c.granted).map(c => c.child_id);

      if (grantedChildIds.length === 0) return [];

      const { data: sessions, error } = await supabase
        .from("screen_sessions")
        .select(`
          *,
          children!inner(name, anonymous_id),
          devices!inner(device_type, device_name)
        `)
        .in("child_id", grantedChildIds)
        .gte("start_time", `${selectedDateStr}T00:00:00`)
        .lte("start_time", `${selectedDateStr}T23:59:59`)
        .order("start_time", { ascending: false });

      if (error) throw error;
      return sessions || [];
    },
    enabled: !!data?.consents,
  });

  // Calculate daily totals by device and child
  const dailyTotals = useMemo(() => {
    if (!dailySessions || dailySessions.length === 0) return null;

    const byDevice: Record<string, number> = {};
    const byChild: Record<string, { name: string; minutes: number }> = {};

    dailySessions.forEach((session: any) => {
      const device = session.devices?.device_type || "Unknown";
      const childName = session.children?.name || "Unknown";
      const minutes = session.duration_minutes || 0;

      byDevice[device] = (byDevice[device] || 0) + minutes;
      
      if (!byChild[session.child_id]) {
        byChild[session.child_id] = { name: childName, minutes: 0 };
      }
      byChild[session.child_id].minutes += minutes;
    });

    return { byDevice, byChild };
  }, [dailySessions]);

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

  const handleExportData = () => {
    if (!chartData) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Data Points', chartData.totalDataPoints],
      ['Date Range', `${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`],
      ['Average Screen Time', `${data?.stats.avgScreenTime || 0} hours`],
      ['Total Participants', data?.stats.totalChildren || 0],
      ...chartData.dailyData.map(d => [`${d.date} Total`, `${d.total} hours`]),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive data analysis and insights</p>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex items-center gap-2">
          <Button
            variant={dateRange.from.getTime() === subDays(new Date(), 7).getTime() ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange.from.getTime() === subDays(new Date(), 30).getTime() ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange.from.getTime() === subDays(new Date(), 90).getTime() ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickRange(90)}
          >
            90 Days
          </Button>
          
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">From Date</p>
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                    disabled={(date) => date > new Date() || date > dateRange.to}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">To Date</p>
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                    disabled={(date) => date > new Date() || date < dateRange.from}
                  />
                </div>
                <Button className="w-full" onClick={() => setShowDatePicker(false)}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Participant and Child Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 flex flex-wrap gap-4">
            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parents</SelectItem>
                {uniqueParents.map((email) => (
                  <SelectItem key={email} value={email}>
                    {email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search by child name or ID..."
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
      </Card>

      {/* Active Filters Display */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <Badge variant="outline" className="gap-2">
              <Calendar className="h-3 w-3" />
              {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Activity className="h-3 w-3" />
              {chartData?.totalDataPoints || 0} data points
            </Badge>
            {parentFilter !== "all" && (
              <Badge variant="outline" className="gap-2">
                Parent: {parentFilter}
              </Badge>
            )}
            {childFilter && (
              <Badge variant="outline" className="gap-2">
                Child: {childFilter}
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Detailed Reports</TabsTrigger>
          <TabsTrigger value="daily">Daily Details</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chartData?.totalDataPoints || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">In selected range</p>
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
                {formatHoursToTime(data.stats.avgScreenTime)}
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
              <CardTitle>Daily Screen Time Trend</CardTitle>
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

      {/* Age Group Comparative Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Screen Time by Age Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData?.ageGroupChartData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="ageGroup"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Avg Hours", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="avgScreenTime"
                  fill={COLORS.phone}
                  name="Total Screen Time"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="avgEducational"
                  fill={COLORS.educational}
                  name="Educational"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="avgEntertainment"
                  fill={COLORS.entertainment}
                  name="Entertainment"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Device Preferences by Age Group */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Preferences by Age Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={chartData?.ageDeviceData || []}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis
                  dataKey="ageGroup"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, "auto"]}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Radar
                  name="Phone"
                  dataKey="phone"
                  stroke={COLORS.phone}
                  fill={COLORS.phone}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Tablet"
                  dataKey="tablet"
                  stroke={COLORS.tablet}
                  fill={COLORS.tablet}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Laptop"
                  dataKey="laptop"
                  stroke={COLORS.laptop}
                  fill={COLORS.laptop}
                  fillOpacity={0.6}
                />
                <Radar
                  name="TV"
                  dataKey="tv"
                  stroke={COLORS.tv}
                  fill={COLORS.tv}
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Weekly Screen Time by Device</CardTitle>
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
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Screen Time</p>
                <p className="text-2xl font-bold">
                  {formatHoursToTime(
                    chartData?.dailyData.reduce((sum, d) => sum + d.total, 0) || 0
                  )}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Educational</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatHoursToTime(
                    chartData?.dailyData.reduce((sum, d) => sum + d.educational, 0) || 0
                  )}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Entertainment</p>
                <p className="text-2xl font-bold text-orange-500">
                  {formatHoursToTime(
                    chartData?.dailyData.reduce((sum, d) => sum + d.entertainment, 0) || 0
                  )}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Per Day</p>
                <p className="text-2xl font-bold">
                  {formatHoursToTime(
                    (chartData?.dailyData.reduce((sum, d) => sum + d.total, 0) || 0) / 
                    (chartData?.dailyData.length || 1)
                  )}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold">{chartData?.dailyData.length || 0}</p>
              </div>
            </Card>
          </div>

          {/* Daily Trend with Educational/Entertainment Split */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Screen Time Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData?.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="educational" stackId="a" fill={COLORS.educational} name="Educational" />
                  <Bar dataKey="entertainment" stackId="a" fill={COLORS.entertainment} name="Entertainment" />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Usage Comparison */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData?.deviceData}
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Time by Device</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData?.deviceAverages} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="device" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="average" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Age Group Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Screen Time by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData?.ageGroupChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ageGroup" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgEducational" fill={COLORS.educational} name="Avg Educational" />
                  <Bar dataKey="avgEntertainment" fill={COLORS.entertainment} name="Avg Entertainment" />
                  <Bar dataKey="avgScreenTime" fill="hsl(var(--chart-1))" name="Avg Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Aggregate Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData?.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="tv" stackId="1" stroke={COLORS.tv} fill={COLORS.tv} name="TV" />
                  <Area type="monotone" dataKey="phone" stackId="1" stroke={COLORS.phone} fill={COLORS.phone} name="Phone" />
                  <Area type="monotone" dataKey="tablet" stackId="1" stroke={COLORS.tablet} fill={COLORS.tablet} name="Tablet" />
                  <Area type="monotone" dataKey="laptop" stackId="1" stroke={COLORS.laptop} fill={COLORS.laptop} name="Laptop" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Preference by Age Group */}
          <Card>
            <CardHeader>
              <CardTitle>Device Preference by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData?.ageDeviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ageGroup" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="phone" fill={COLORS.phone} name="Phone" />
                  <Bar dataKey="tablet" fill={COLORS.tablet} name="Tablet" />
                  <Bar dataKey="laptop" fill={COLORS.laptop} name="Laptop" />
                  <Bar dataKey="tv" fill={COLORS.tv} name="TV" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-6">
          {/* Date Picker */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Date</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(selectedDailyDate, "MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card z-50" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDailyDate}
                    onSelect={(date) => date && setSelectedDailyDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </Card>

          {/* Daily Summary Cards */}
          {dailyTotals && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Screen Time by Device</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dailyTotals.byDevice).map(([device, minutes]) => (
                      <div key={device} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{device}</span>
                        <span className="font-semibold">{formatMinutesToTime(minutes)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">
                          {formatMinutesToTime(Object.values(dailyTotals.byDevice).reduce((sum, m) => sum + m, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Screen Time by Child</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dailyTotals.byChild).map(([childId, data]) => (
                      <div key={childId} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{data.name}</span>
                        <span className="font-semibold">{formatMinutesToTime(data.minutes)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Session Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details - {format(selectedDailyDate, "MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!dailySessions || dailySessions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No Sessions Found</p>
                  <p className="text-sm mt-1">No screen time sessions recorded for {format(selectedDailyDate, "MMMM d, yyyy")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailySessions.map((session: any) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={session.session_type === "manual" ? "default" : "secondary"}>
                              {session.session_type || "auto"}
                            </Badge>
                            <span className="font-semibold">{session.children?.name}</span>
                            <span className="text-xs text-muted-foreground">({session.children?.anonymous_id})</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Smartphone className="h-4 w-4" />
                              <span>{session.devices?.device_type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(session.start_time), "HH:mm")} - {session.end_time ? format(new Date(session.end_time), "HH:mm") : "Ongoing"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatMinutesToTime(session.duration_minutes || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Screen Time Insights */}
              {chartData && chartData.dailyData.length > 0 && (
                <>
                  {chartData.dailyData.reduce((sum, d) => sum + d.total, 0) / chartData.dailyData.length > 3 && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                      <Activity className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-500">High Daily Average</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Average daily screen time ({formatHoursToTime(chartData.dailyData.reduce((sum, d) => sum + d.total, 0) / chartData.dailyData.length)}) 
                          exceeds recommended limits. Consider implementing time restrictions.
                        </p>
                      </div>
                    </div>
                  )}

                  {chartData.contentData[0]?.value / (chartData.contentData[0]?.value + chartData.contentData[1]?.value) < 0.3 && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                      <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-500">Low Educational Content</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Only {((chartData.contentData[0]?.value / (chartData.contentData[0]?.value + chartData.contentData[1]?.value)) * 100).toFixed(0)}% 
                          of screen time is educational. Encourage more learning-focused activities.
                        </p>
                      </div>
                    </div>
                  )}

                  {chartData.ageGroupChartData.length > 1 && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                      <Users2 className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-500">Age Group Variations</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Different age groups show varying screen time patterns. Older children typically use more laptop/phone time.
                        </p>
                      </div>
                    </div>
                  )}

                  {chartData.deviceData.length > 0 && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                      <Smartphone className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-500">Most Used Device</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {chartData.deviceData[0]?.name} is the most commonly used device with {chartData.deviceData[0]?.value.toFixed(1)} hours of usage.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {(!chartData || chartData.dailyData.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No data available for insights. Adjust filters to view insights.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Metrics */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Educational</span>
                      <span className="font-semibold text-green-500">
                        {chartData?.contentData[0]?.value ? 
                          ((chartData.contentData[0].value / (chartData.contentData[0].value + chartData.contentData[1].value)) * 100).toFixed(0) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ 
                          width: `${chartData?.contentData[0]?.value ? 
                            ((chartData.contentData[0].value / (chartData.contentData[0].value + chartData.contentData[1].value)) * 100) 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Entertainment</span>
                      <span className="font-semibold text-orange-500">
                        {chartData?.contentData[1]?.value ? 
                          ((chartData.contentData[1].value / (chartData.contentData[0].value + chartData.contentData[1].value)) * 100).toFixed(0) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ 
                          width: `${chartData?.contentData[1]?.value ? 
                            ((chartData.contentData[1].value / (chartData.contentData[0].value + chartData.contentData[1].value)) * 100) 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participant Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Children</span>
                    <span className="font-semibold">{data?.stats.totalChildren || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Age Groups</span>
                    <span className="font-semibold">{chartData?.ageGroupChartData.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Parents</span>
                    <span className="font-semibold">{uniqueParents.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Records</span>
                    <span className="font-semibold">{chartData?.totalDataPoints || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date Range</span>
                    <span className="font-semibold">{chartData?.dailyData.length || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completeness</span>
                    <span className="font-semibold text-green-500">
                      {chartData?.totalDataPoints ? '100%' : '0%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
