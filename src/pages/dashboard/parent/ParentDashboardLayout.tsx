import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Home, Smartphone, Activity, BarChart3, LogOut, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ParentDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard/parent", icon: Home, label: "Overview" },
    { path: "/dashboard/parent/children", icon: Users, label: "Children" },
    { path: "/dashboard/parent/devices", icon: Smartphone, label: "Devices" },
    { path: "/dashboard/parent/activity-logs", icon: Clock, label: "Activity Logs" },
    { path: "/dashboard/parent/reports", icon: BarChart3, label: "Reports" },
    { path: "/dashboard/parent/consents", icon: Shield, label: "Consents" },
    { path: "/dashboard/parent/sessions", icon: Activity, label: "Sessions" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Shield className="mr-2 h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Screen Guardian</span>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ParentDashboardLayout;
