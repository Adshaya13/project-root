import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { AuthCallback } from "./pages/auth/AuthCallback";
import { RoleSelection } from "./pages/auth/RoleSelection";
import { UserDashboard } from "./pages/dashboard/UserDashboard";
import { BrowseResources } from "./pages/resources/BrowseResources";
import { ResourceDetail } from "./pages/resources/ResourceDetail";
import { MyBookings } from "./pages/bookings/MyBookings";
import { MyTickets } from "./pages/tickets/MyTickets";
import { Home } from "./pages/Home";
import { CreateTicket } from "./pages/tickets/CreateTicket";
import { TicketDetail } from "./pages/tickets/TicketDetail";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ResourceManagement } from "./pages/admin/ResourceManagement";
import { AllBookings } from "./pages/admin/AllBookings";
import { AllTickets } from "./pages/admin/AllTickets";
import { UserManagement } from "./pages/admin/UserManagement";
import { Analytics } from "./pages/admin/Analytics";
import { TechnicianDashboard } from "./pages/technician/TechnicianDashboard";
import { AssignedTickets } from "./pages/technician/AssignedTickets";
import "./App.css";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/google" element={<AuthCallback />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/" element={<Home />} />

      {/* USER routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
            <BrowseResources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/:id"
        element={
          <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
            <ResourceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/my"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/my"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <MyTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <CreateTicket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        }
      />

      {/* ADMIN routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/resources"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ResourceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AllBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AllTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* TECHNICIAN routes */}
      <Route
        path="/technician/dashboard"
        element={
          <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
            <TechnicianDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/tickets"
        element={
          <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
            <AssignedTickets />
          </ProtectedRoute>
        }
      />

      {/* Shared routes */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 403 page */}
      <Route
        path="/403"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f111a] transition-colors duration-300">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                403
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                You don't have permission to access this page
              </p>
              <a href="/" className="text-[#f97316] hover:underline">
                Go back home
              </a>
            </div>
          </div>
        }
      />

      {/* 404 page */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f111a] transition-colors duration-300">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                404
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                Page not found
              </p>
              <a href="/" className="text-[#f97316] hover:underline">
                Go back home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppRouter />
            <Toaster position="top-right" />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
