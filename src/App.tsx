import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSessionTracking } from "@/hooks/useSessionTracking";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SessionTracking from "./pages/SessionTracking";
import NotFound from "./pages/NotFound";

import ParentDashboardLayout from "./pages/dashboard/parent/ParentDashboardLayout";
import ParentDashboard from "./pages/dashboard/parent/ParentDashboard";
import Children from "./pages/dashboard/parent/Children";
import Devices from "./pages/dashboard/parent/Devices";
import ActivityLogs from "./pages/dashboard/parent/ActivityLogs";
import SessionLogs from "./pages/dashboard/parent/SessionLogs";
import ParentalControls from "./pages/dashboard/parent/ParentalControls";
import Reports from "./pages/dashboard/parent/Reports";
import Consents from "./pages/dashboard/parent/Consents";
import Sessions from "./pages/dashboard/parent/Sessions";
import Charts from "./pages/dashboard/parent/Charts";

import ResearcherDashboardLayout from "./pages/dashboard/researcher/ResearcherDashboardLayout";
import ResearcherDashboard from "./pages/dashboard/researcher/ResearcherDashboard";
import ResearcherData from "./pages/dashboard/researcher/Data";
import ResearcherAnalytics from "./pages/dashboard/researcher/Analytics";
import ResearcherParticipants from "./pages/dashboard/researcher/Participants";
import ResearcherSessionLogs from "./pages/dashboard/researcher/SessionLogs";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const AppContent = () => {
  useSessionTracking();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes with header/footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
          </Route>

          <Route path="/session-tracking" element={<SessionTracking />} />

          {/* Parent Dashboard */}
          <Route
            path="/dashboard/parent"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <ParentDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ParentDashboard />} />
            <Route path="children" element={<Children />} />
            <Route path="devices" element={<Devices />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="session-logs" element={<SessionLogs />} />
            <Route path="parental-controls" element={<ParentalControls />} />
            <Route path="reports" element={<Reports />} />
            <Route path="consents" element={<Consents />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="charts" element={<Charts />} />
          </Route>

          {/* Researcher Dashboard */}
          <Route
            path="/dashboard/researcher"
            element={
              <ProtectedRoute allowedRoles={["researcher"]}>
                <ResearcherDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ResearcherDashboard />} />
            <Route path="data" element={<ResearcherData />} />
            <Route path="analytics" element={<ResearcherAnalytics />} />
            <Route path="participants" element={<ResearcherParticipants />} />
            <Route path="session-logs" element={<ResearcherSessionLogs />} />
          </Route>

          {/* Admin Dashboard */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
