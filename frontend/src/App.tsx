import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import AdminDashboard from "./pages/dashboards/admin/AdminDashboard";
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
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
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
