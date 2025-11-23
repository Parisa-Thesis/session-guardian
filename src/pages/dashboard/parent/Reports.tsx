import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeeklyStats } from "@/hooks/useWeeklyStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, subDays, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Clock, BookOpen, Tv, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Reports() {
  const { data: weeklyStats, isLoading: isLoadingWeekly } = useWeeklyStats();

  // Fetch daily stats
  const { data: dailyStats, isLoading: isLoadingDaily } = useQuery({
    queryKey: ["daily-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date();
      const sevenDaysAgo = subDays(today, 7);

      const { data: children } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", user.id);

      if (!children || children.length === 0) return [];

      const childIds = children.map(c => c.id);

      const { data: aggregates } = await supabase
        .from("child_daily_aggregate")
        .select("*")
        .in("child_id", childIds)
        .gte("activity_date", format(sevenDaysAgo, "yyyy-MM-dd"))
        .lte("activity_date", format(today, "yyyy-MM-dd"))
        .order("activity_date");

      const dailyData: Record<string, any> = (aggregates || []).reduce((acc: any, agg: any) => {
        const date = format(new Date(agg.activity_date), "MMM dd");
        if (!acc[date]) {
          acc[date] = {
            date,
            screenTime: 0,
            tv: 0,
            phone: 0,
            tablet: 0,
            laptop: 0,
          };
        }
        acc[date].screenTime += (agg.total_minutes || 0) / 60;
        acc[date].tv += (agg.tv_minutes || 0) / 60;
        acc[date].phone += (agg.phone_minutes || 0) / 60;
        acc[date].tablet += (agg.tablet_minutes || 0) / 60;
        acc[date].laptop += (agg.laptop_minutes || 0) / 60;
        return acc;
      }, {});

      return Object.values(dailyData) as Array<{
        date: string;
        screenTime: number;
        tv: number;
        phone: number;
        tablet: number;
        laptop: number;
      }>;
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
                    <p className="text-sm text-muted-foreground">Total Today</p>
                    <p className="text-2xl font-bold text-foreground">
                      {((dailyStats?.[dailyStats.length - 1]?.screenTime || 0)).toFixed(1)}h
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
                      {((dailyStats?.[dailyStats.length - 1]?.tv || 0)).toFixed(1)}h
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
                      {((dailyStats?.[dailyStats.length - 1]?.phone || 0)).toFixed(1)}h
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
                      {(((dailyStats?.[dailyStats.length - 1]?.tablet || 0) + (dailyStats?.[dailyStats.length - 1]?.laptop || 0))).toFixed(1)}h
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Daily Screen Time (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
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
                <Bar dataKey="tv" fill="#3b82f6" name="TV" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="phone" fill="#8b5cf6" name="Phone" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="tablet" fill="#f59e0b" name="Tablet" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="laptop" fill="#10b981" name="Laptop" stackId="a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Daily Insights</h3>
            <div className="space-y-3 text-sm">
              {((dailyStats?.[dailyStats.length - 1]?.screenTime || 0) > 3) && (
                <p className="flex items-start gap-2">
                  <span className="text-orange-500">⚠️</span>
                  <span className="text-foreground">
                    Today's screen time ({((dailyStats?.[dailyStats.length - 1]?.screenTime || 0)).toFixed(1)}h) is above recommended daily limits.
                  </span>
                </p>
              )}
              <p className="flex items-start gap-2">
                <span className="text-blue-500">💡</span>
                <span className="text-foreground">
                  Track device usage patterns to understand which devices your children use most.
                </span>
              </p>
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
                    <p className="text-2xl font-bold text-foreground">{totalWeeklyScreenTime.toFixed(1)}h</p>
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
                    <p className="text-2xl font-bold text-foreground">{totalWeeklyEducational.toFixed(1)}h</p>
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
                    <p className="text-2xl font-bold text-foreground">{totalWeeklyEntertainment.toFixed(1)}h</p>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats}>
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
                <Bar dataKey="screenTime" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recommendations</h3>
            <ul className="space-y-3">
              {totalWeeklyScreenTime / 7 > 3 && (
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500">⚠️</span>
                  <span className="text-foreground">
                    Average daily screen time ({(totalWeeklyScreenTime / 7).toFixed(1)}h) exceeds recommended limits. Consider setting daily time limits.
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
