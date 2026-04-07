import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import AdminDashboardPage from "./pages/dashboards/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/dashboards/admin/AdminUsersPage";
import AdminResourcesPage from "./pages/dashboards/admin/AdminResourcesPage";
import AdminBookingsPage from "./pages/dashboards/admin/AdminBookingsPage";
import AdminTicketsPage from "./pages/dashboards/admin/AdminTicketsPage";
import StaffDashboard from "./pages/dashboards/staff/StaffDashboard";
import StudentDashboard from "./pages/dashboards/student/StudentDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
          <Route path="/dashboard/admin/users" element={<AdminUsersPage />} />
          <Route path="/dashboard/admin/resources" element={<AdminResourcesPage />} />
          <Route path="/dashboard/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/dashboard/admin/tickets" element={<AdminTicketsPage />} />
          <Route path="/dashboard/admin/*" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/dashboard/staff" element={<StaffDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/:role" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
