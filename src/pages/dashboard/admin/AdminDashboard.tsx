import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Settings, Activity, Baby } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { motion } from "framer-motion";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { data, isLoading, error } = useAdminData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid gap-6 md:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and user management</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Users className="mr-2 h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.stats.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Shield className="mr-2 h-4 w-4" />
                Parents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.stats.parentCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Activity className="mr-2 h-4 w-4" />
                Researchers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.stats.researcherCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Settings className="mr-2 h-4 w-4" />
                Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.stats.devicesCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>All Users ({data?.profiles.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {data?.profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{profile.name || "Unnamed User"}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <Badge variant={
                    profile.role === "admin" ? "default" :
                    profile.role === "researcher" ? "secondary" :
                    "outline"
                  }>
                    {profile.role}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {data?.recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {session.user_id.slice(0, 8)}...
                    </Badge>
                    <Badge className={session.logout_time ? "bg-muted" : "bg-green-500/10 text-green-500"}>
                      {session.logout_time ? "Ended" : "Active"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.login_time), "MMM d, HH:mm")}
                  </p>
                  {session.session_duration_seconds && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {Math.floor(session.session_duration_seconds / 60)}m
                    </p>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Baby className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{data?.stats.childrenCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Children Registered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{data?.recentSessions.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Recent Sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{data?.stats.adminCount || 0}</p>
                  <p className="text-sm text-muted-foreground">System Admins</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
