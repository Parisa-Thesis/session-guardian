import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Home, Smartphone, Activity, BarChart3, LogOut, Users, Clock, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useTranslation } from "react-i18next";

const ParentDashboardLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t('auth.signOutSuccess'));
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard/parent", icon: Home, label: t('parent.overview') },
    { path: "/dashboard/parent/children", icon: Users, label: t('parent.children') },
    { path: "/dashboard/parent/devices", icon: Smartphone, label: t('parent.devices') },
    { path: "/dashboard/parent/sessions", icon: Clock, label: t('parent.sessions') },
    { path: "/dashboard/parent/device-integration", icon: Wifi, label: t('parent.autoTracking') },
    { path: "/dashboard/parent/activity-logs", icon: Activity, label: t('parent.activityLogs') },
    { path: "/dashboard/parent/parental-controls", icon: Shield, label: t('parent.parentalControls') },
    { path: "/dashboard/parent/reports", icon: BarChart3, label: t('parent.reports') },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 bg-background">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card">
          <div className="flex h-16 items-center border-b px-6">
            <Shield className="mr-2 h-6 w-6 text-primary" />
            <span className="text-lg font-bold">{t('parent.screenGuardian')}</span>
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
              {t('common.signOut')}
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
      <Footer />
    </div>
  );
};

export default ParentDashboardLayout;
