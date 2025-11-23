import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeeklyStats } from "@/hooks/useWeeklyStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, subDays, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Clock, BookOpen, Tv, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatMinutesToTime, minutesToHours } from "@/lib/timeUtils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: weeklyStats, isLoading: isLoadingWeekly } = useWeeklyStats();

  // Fetch daily stats for selected date
  const { data: dailyStats, isLoading: isLoadingDaily } = useQuery({
    queryKey: ["daily-stats", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: children } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", user.id);

      if (!children || children.length === 0) return null;

      const childIds = children.map(c => c.id);

      const { data: aggregates } = await supabase
        .from("child_daily_aggregate")
        .select("*")
        .in("child_id", childIds)
        .eq("activity_date", format(selectedDate, "yyyy-MM-dd"));

      if (!aggregates || aggregates.length === 0) return null;

      // Aggregate all children's data for the selected day
      const dayData = aggregates.reduce((acc: any, agg: any) => {
        return {
          screenTime: acc.screenTime + ((agg.total_minutes || 0) / 60),
          tv: acc.tv + ((agg.tv_minutes || 0) / 60),
          phone: acc.phone + ((agg.phone_minutes || 0) / 60),
          tablet: acc.tablet + ((agg.tablet_minutes || 0) / 60),
          laptop: acc.laptop + ((agg.laptop_minutes || 0) / 60),
        };
      }, {
        screenTime: 0,
        tv: 0,
        phone: 0,
        tablet: 0,
        laptop: 0,
      });

      return dayData;
    },
  });

  const { data: monthlyStats, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["monthly-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date();
      const threeMonthsAgo = subMonths(today, 3);

      const { data: logs } = await supabase
        .from("screen_activity_logs")
        .select("*")
        .eq("parent_id", user.id)
        .gte("activity_date", format(threeMonthsAgo, "yyyy-MM-dd"))
        .lte("activity_date", format(today, "yyyy-MM-dd"));

      const monthlyData = (logs || []).reduce((acc: any, log: any) => {
        const month = format(new Date(log.activity_date), "MMM yyyy");
        if (!acc[month]) {
          acc[month] = {
            month,
            screenTime: 0,
            educational: 0,
            entertainment: 0,
          };
        }
        acc[month].screenTime += log.hours_screen_time || 0;
        acc[month].educational += log.hours_educational || 0;
        acc[month].entertainment += log.hours_entertainment || 0;
        return acc;
      }, {});

      return Object.values(monthlyData);
    },
  });

  const calculateTrend = (data: any[]) => {
    if (!data || data.length < 2) return { value: 0, isPositive: false };
    const latest = data[data.length - 1]?.screenTime || 0;
    const previous = data[data.length - 2]?.screenTime || 0;
    const change = ((latest - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), isPositive: change > 0 };
  };

  const weeklyTrend = calculateTrend(weeklyStats || []);
  const monthlyTrend = calculateTrend(monthlyStats || []);

  if (isLoadingWeekly || isLoadingMonthly || isLoadingDaily) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const totalWeeklyScreenTime = Number((weeklyStats || []).reduce((sum: number, day: any) => sum + (day.screenTime || 0), 0));
  const totalWeeklyEducational = Number((weeklyStats || []).reduce((sum: number, day: any) => sum + (day.educational || 0), 0));
  const totalWeeklyEntertainment = Number((weeklyStats || []).reduce((sum: number, day: any) => sum + (day.entertainment || 0), 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Screen Time Reports</h1>
        <p className="text-muted-foreground mt-2">
          View weekly and monthly screen time patterns with insights
        </p>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList>
          <TabsTrigger value="daily">Daily Report</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          {/* Date Picker */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Date</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(selectedDate, "MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card z-50" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Screen Time</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatMinutesToTime(Math.round((dailyStats?.screenTime || 0) * 60))}
                    </p>
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
                    <Tv className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TV</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatMinutesToTime(Math.round((dailyStats?.tv || 0) * 60))}
                    </p>
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
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <BookOpen className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatMinutesToTime(Math.round((dailyStats?.phone || 0) * 60))}
                    </p>
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
                    <Tv className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tablet/Laptop</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatMinutesToTime(Math.round(((dailyStats?.tablet || 0) + (dailyStats?.laptop || 0)) * 60))}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Screen Time Breakdown - {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            {!dailyStats ? (
              <div className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No Data Available</p>
                  <p className="text-sm mt-1">No screen time recorded for {format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { device: 'TV', hours: dailyStats.tv },
                  { device: 'Phone', hours: dailyStats.phone },
                  { device: 'Tablet', hours: dailyStats.tablet },
                  { device: 'Laptop', hours: dailyStats.laptop },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="device" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value.toFixed(2)} hours`}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Daily Insights</h3>
            <div className="space-y-3 text-sm">
              {dailyStats && dailyStats.screenTime > 3 && (
                <p className="flex items-start gap-2">
                  <span className="text-orange-500">⚠️</span>
                   <span className="text-foreground">
                    Screen time on {format(selectedDate, "MMMM d")} ({formatMinutesToTime(Math.round(dailyStats.screenTime * 60))}) is above recommended daily limits.
                  </span>
                </p>
              )}
              {dailyStats && dailyStats.screenTime <= 2 && (
                <p className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-foreground">
                    Great! Screen time is within healthy limits for {format(selectedDate, "MMMM d")}.
                  </span>
                </p>
              )}
              {!dailyStats && (
                <p className="flex items-start gap-2">
                  <span className="text-blue-500">💡</span>
                  <span className="text-foreground">
                    No data recorded for this date. Select a different date or start tracking screen time.
                  </span>
                </p>
              )}
              {dailyStats && (
                <p className="flex items-start gap-2">
                  <span className="text-blue-500">📊</span>
                  <span className="text-foreground">
                    Most used device: {
                      dailyStats.tv >= Math.max(dailyStats.phone, dailyStats.tablet, dailyStats.laptop) ? 'TV' :
                      dailyStats.phone >= Math.max(dailyStats.tv, dailyStats.tablet, dailyStats.laptop) ? 'Phone' :
                      dailyStats.tablet >= Math.max(dailyStats.tv, dailyStats.phone, dailyStats.laptop) ? 'Tablet' : 'Laptop'
                    }
                  </span>
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Screen Time</p>
                    <p className="text-2xl font-bold text-foreground">{formatMinutesToTime(Math.round(totalWeeklyScreenTime * 60))}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {weeklyTrend.isPositive ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`text-xs ${weeklyTrend.isPositive ? "text-destructive" : "text-green-500"}`}>
                        {weeklyTrend.value}% vs last week
                      </span>
                    </div>
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
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <BookOpen className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Educational</p>
                    <p className="text-2xl font-bold text-foreground">{formatMinutesToTime(Math.round(totalWeeklyEducational * 60))}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((totalWeeklyEducational / totalWeeklyScreenTime) * 100 || 0).toFixed(0)}% of total
                    </p>
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
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <Tv className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entertainment</p>
                    <p className="text-2xl font-bold text-foreground">{formatMinutesToTime(Math.round(totalWeeklyEntertainment * 60))}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((totalWeeklyEntertainment / totalWeeklyScreenTime) * 100 || 0).toFixed(0)}% of total
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Daily Screen Time (Last 7 Days)</h3>
            {!weeklyStats || weeklyStats.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No Data Available</p>
                  <p className="text-sm mt-1">Start tracking screen time to see weekly reports</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyStats}>
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
                  <Bar dataKey="screenTime" fill="hsl(var(--primary))" name="Total Screen Time" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recommendations</h3>
            <ul className="space-y-3">
              {totalWeeklyScreenTime / 7 > 3 && (
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500">⚠️</span>
                  <span className="text-foreground">
                    Average daily screen time ({formatMinutesToTime(Math.round((totalWeeklyScreenTime / 7) * 60))}) exceeds recommended limits. Consider setting daily time limits.
                  </span>
                </li>
              )}
              {(totalWeeklyEducational / totalWeeklyScreenTime) * 100 < 30 && (
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500">💡</span>
                  <span className="text-foreground">
                    Only {((totalWeeklyEducational / totalWeeklyScreenTime) * 100).toFixed(0)}% of screen time is educational. Try increasing educational content.
                  </span>
                </li>
              )}
              {weeklyTrend.isPositive && (
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-500">📈</span>
                  <span className="text-foreground">
                    Screen time increased by {weeklyTrend.value}% compared to last week. Monitor this trend.
                  </span>
                </li>
              )}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Monthly Screen Time Trends</h3>
            {!monthlyStats || monthlyStats.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No Data Available</p>
                  <p className="text-sm mt-1">Start tracking screen time to see monthly trends</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
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
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Monthly Insights</h3>
            <div className="space-y-3 text-sm text-foreground">
              <p>
                Track long-term trends to understand seasonal patterns in your children's screen time usage.
              </p>
              <p className="text-muted-foreground">
                Email summaries feature coming soon - you'll be able to receive these reports directly in your inbox.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
