import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/auth";
import type { DashboardData, Role } from "@/types/auth";

const allowedRoles: Role[] = ["admin", "student", "staff"];

export default function DashboardPage() {
  const { role } = useParams();
  const { session, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const requestedRole = useMemo<Role | null>(() => {
    if (!role) {
      return null;
    }

    const normalized = role.toLowerCase();
    return allowedRoles.includes(normalized as Role) ? (normalized as Role) : null;
  }, [role]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!session) {
        return;
      }

      const currentRole = requestedRole ?? session.user.role;
      if (session.user.role !== "admin" && session.user.role !== currentRole) {
        return;
      }

      try {
        setLoading(true);
        const data = await authApi.getDashboard(session.token, currentRole);
        setDashboard(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [requestedRole, session]);

  if (!session) {
    return <Navigate to="/?view=login" replace />;
  }

  const activeRole = requestedRole ?? session.user.role;
  if (session.user.role !== "admin" && session.user.role !== activeRole) {
    return <Navigate to={`/dashboard/${session.user.role}`} replace />;
  }

  if (loading || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="rounded-3xl border border-white/10 bg-white/6 px-6 py-5 text-sm backdrop-blur-xl">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return <DashboardShell role={activeRole} dashboard={dashboard} userName={session.user.fullName} onLogout={logout} />;
}