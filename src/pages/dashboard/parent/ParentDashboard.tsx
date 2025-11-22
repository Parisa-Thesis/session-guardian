import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Smartphone, Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ParentDashboard = () => {
  const stats = [
    {
      title: "Total Children",
      value: "3",
      icon: Users,
      description: "Active profiles",
      color: "text-primary",
    },
    {
      title: "Monitored Devices",
      value: "5",
      icon: Smartphone,
      description: "Connected devices",
      color: "text-secondary",
    },
    {
      title: "Active Sessions",
      value: "2",
      icon: Activity,
      description: "Currently active",
      color: "text-accent",
    },
    {
      title: "Weekly Usage",
      value: "24h",
      icon: TrendingUp,
      description: "Total screen time",
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">Monitor your children's screen time and activity</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest screen time sessions from your children</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Child {i}</p>
                  <p className="text-sm text-muted-foreground">Device: iPad {i}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">2h 30m</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboard;
