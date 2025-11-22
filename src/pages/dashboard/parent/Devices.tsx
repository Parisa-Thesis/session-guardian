import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Monitor, Plus } from "lucide-react";

const Devices = () => {
  const devices = [
    { id: 1, name: "iPad Pro", type: "tablet", child: "Emma", status: "online", lastActive: "2 min ago" },
    { id: 2, name: "iPhone 13", type: "phone", child: "Noah", status: "online", lastActive: "Just now" },
    { id: 3, name: "Samsung Galaxy", type: "phone", child: "Olivia", status: "offline", lastActive: "1 hour ago" },
    { id: 4, name: "MacBook Air", type: "computer", child: "Emma", status: "offline", lastActive: "3 hours ago" },
    { id: 5, name: "iPad Mini", type: "tablet", child: "Noah", status: "online", lastActive: "5 min ago" },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "tablet":
        return Tablet;
      case "phone":
        return Smartphone;
      case "computer":
        return Monitor;
      default:
        return Smartphone;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Devices</h1>
          <p className="text-muted-foreground">Manage all monitored devices</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => {
          const Icon = getDeviceIcon(device.type);
          return (
            <Card key={device.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription>{device.child}'s device</CardDescription>
                    </div>
                  </div>
                  <Badge variant={device.status === "online" ? "default" : "secondary"}>
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last active:</span>
                    <span className="font-medium">{device.lastActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{device.type}</span>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Devices;
