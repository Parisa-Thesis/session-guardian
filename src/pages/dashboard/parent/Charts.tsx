import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const Charts = () => {
  const dailyData = [
    { day: "Mon", hours: 4.5 },
    { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 5.1 },
    { day: "Thu", hours: 2.8 },
    { day: "Fri", hours: 4.9 },
    { day: "Sat", hours: 6.2 },
    { day: "Sun", hours: 5.5 },
  ];

  const weeklyData = [
    { week: "Week 1", emma: 28, noah: 24, olivia: 32 },
    { week: "Week 2", emma: 31, noah: 26, olivia: 29 },
    { week: "Week 3", emma: 26, noah: 28, olivia: 35 },
    { week: "Week 4", emma: 29, noah: 25, olivia: 30 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Visualize screen time patterns and trends</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Screen Time</CardTitle>
            <CardDescription>Total hours per day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
            <CardDescription>Screen time comparison by child</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="emma" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="noah" stroke="hsl(var(--secondary))" strokeWidth={2} />
                <Line type="monotone" dataKey="olivia" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Insights</CardTitle>
          <CardDescription>Key patterns and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-primary">📊 Peak Usage Time</h4>
              <p className="text-sm text-muted-foreground">Most screen time occurs between 3-6 PM on weekdays</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-secondary">✅ Healthy Patterns</h4>
              <p className="text-sm text-muted-foreground">Emma maintains consistent daily limits throughout the week</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-accent">⚠️ Attention Needed</h4>
              <p className="text-sm text-muted-foreground">Olivia's weekend usage is 40% higher than weekday average</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;
