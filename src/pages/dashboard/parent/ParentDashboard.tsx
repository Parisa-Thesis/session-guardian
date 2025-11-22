import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Smartphone, Activity, TrendingUp, Clock, BookOpen, Gamepad2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useParentData } from "@/hooks/useParentData";
import { useWeeklyStats } from "@/hooks/useWeeklyStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ParentDashboard = () => {
  const { data, isLoading } = useParentData();
  const { data: weeklyStats, isLoading: statsLoading } = useWeeklyStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalWeeklyHours = (weeklyStats || []).reduce((sum: number, day: any) => sum + (day.screenTime || 0), 0);
  
  const stats = [
    {
      title: "Total Children",
      value: data?.children?.length || 0,
      icon: Users,
      description: "Active profiles",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Monitored Devices",
      value: data?.devices?.length || 0,
      icon: Smartphone,
      description: "Connected devices",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Active Sessions",
      value: data?.activeSessions?.length || 0,
      icon: Activity,
      description: "Currently active",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Weekly Usage",
      value: `${totalWeeklyHours}h`,
      icon: TrendingUp,
      description: "Total screen time",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Parent Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Monitor your children's screen time and activity</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group transition-all hover:shadow-lg hover:scale-105 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Screen Time Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Daily Screen Time
              </CardTitle>
              <CardDescription>Last 7 days screen time breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), "EEE")}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      labelFormatter={(date) => format(new Date(date), "PPP")}
                    />
                    <Legend />
                    <Bar dataKey="screenTime" name="Total Hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Type Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                Activity Breakdown
              </CardTitle>
              <CardDescription>Educational vs Entertainment time</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), "EEE")}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      labelFormatter={(date) => format(new Date(date), "PPP")}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="educational" 
                      name="Educational" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--secondary))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="entertainment" 
                      name="Entertainment" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Recent Activity Logs
            </CardTitle>
            <CardDescription>Latest screen time sessions from your children</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.activityLogs && data.activityLogs.length > 0 ? (
              <div className="space-y-4">
                {data.activityLogs.slice(0, 5).map((log: any, i: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-foreground">{log.children?.name || "Unknown Child"}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            {log.device_type}
                          </span>
                          <span>•</span>
                          <span>{format(new Date(log.activity_date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {log.hours_educational > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <BookOpen className="h-3 w-3" />
                            {log.hours_educational}h edu
                          </Badge>
                        )}
                        {log.hours_entertainment > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Gamepad2 className="h-3 w-3" />
                            {log.hours_entertainment}h fun
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{log.hours_screen_time}h</p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No activity logs yet</p>
                <p className="text-sm text-muted-foreground mt-1">Activity will appear here once your children start using their devices</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ParentDashboard;
