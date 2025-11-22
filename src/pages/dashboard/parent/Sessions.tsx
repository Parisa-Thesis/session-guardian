import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Sessions = () => {
  const sessions = [
    {
      id: 1,
      child: "Emma",
      device: "iPad Pro",
      startTime: "09:30 AM",
      duration: "2h 15m",
      status: "completed",
      date: "Today",
    },
    {
      id: 2,
      child: "Noah",
      device: "iPhone 13",
      startTime: "10:00 AM",
      duration: "1h 45m",
      status: "active",
      date: "Today",
    },
    {
      id: 3,
      child: "Olivia",
      device: "Samsung Galaxy",
      startTime: "08:15 AM",
      duration: "3h 20m",
      status: "completed",
      date: "Today",
    },
    {
      id: 4,
      child: "Emma",
      device: "MacBook Air",
      startTime: "02:00 PM",
      duration: "1h 30m",
      status: "completed",
      date: "Yesterday",
    },
    {
      id: 5,
      child: "Noah",
      device: "iPad Mini",
      startTime: "03:30 PM",
      duration: "45m",
      status: "active",
      date: "Today",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Screen Sessions</h1>
        <p className="text-muted-foreground">View detailed session logs for all devices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Complete history of screen time activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.child}</TableCell>
                  <TableCell>{session.device}</TableCell>
                  <TableCell>{session.startTime}</TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>{session.date}</TableCell>
                  <TableCell>
                    <Badge variant={session.status === "active" ? "default" : "secondary"}>
                      {session.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sessions;
