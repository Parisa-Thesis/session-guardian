import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SessionTracking from "./pages/SessionTracking";
import NotFound from "./pages/NotFound";

import ParentDashboardLayout from "./pages/dashboard/parent/ParentDashboardLayout";
import ParentDashboard from "./pages/dashboard/parent/ParentDashboard";
import Children from "./pages/dashboard/parent/Children";
import Devices from "./pages/dashboard/parent/Devices";
import ActivityLogs from "./pages/dashboard/parent/ActivityLogs";
import ParentalControls from "./pages/dashboard/parent/ParentalControls";
import Reports from "./pages/dashboard/parent/Reports";
import Consents from "./pages/dashboard/parent/Consents";
import Sessions from "./pages/dashboard/parent/Sessions";
import Charts from "./pages/dashboard/parent/Charts";

import ResearcherDashboard from "./pages/dashboard/researcher/ResearcherDashboard";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/session-tracking" element={<SessionTracking />} />

          {/* Parent Dashboard - parent only */}
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
            <Route path="parental-controls" element={<ParentalControls />} />
            <Route path="reports" element={<Reports />} />
            <Route path="consents" element={<Consents />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="charts" element={<Charts />} />
          </Route>

          {/* Researcher Dashboard - researcher only */}
          <Route
            path="/dashboard/researcher"
            element={
              <ProtectedRoute allowedRoles={["researcher"]}>
                <ResearcherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard - admin only */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
