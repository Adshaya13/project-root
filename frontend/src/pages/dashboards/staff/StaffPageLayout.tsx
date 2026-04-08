import type { ReactNode } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, CalendarClock, ClipboardList, History, LayoutDashboard, LogOut, Shield, UserRound, Bell as BellIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StaffPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const navItems = [
  { to: "/dashboard/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/staff/book-resource", label: "Book Resource", icon: ClipboardList },
  { to: "/dashboard/staff/my-bookings", label: "My Bookings", icon: BookOpen },
  { to: "/dashboard/staff/resource-availability", label: "Resource Availability", icon: CalendarClock },
  { to: "/dashboard/staff/booking-history", label: "Booking History", icon: History },
  { to: "/dashboard/staff/notifications", label: "Notifications", icon: BellIcon },
  { to: "/dashboard/staff/profile", label: "Profile", icon: UserRound },
];

export default function StaffPageLayout({ title, subtitle, children }: StaffPageLayoutProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  if (!session || session.user.role !== "staff") {
    return <Navigate to="/?view=login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/?view=login", { replace: true });
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="flex h-full w-full">
        <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col bg-slate-950 text-slate-100 shadow-[0_16px_48px_rgba(15,23,42,0.35)]">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-white">CamBus Flow</div>
                <div className="text-xs text-slate-400">Staff Portal</div>
              </div>
            </div>
          </div>

          <div className="px-3 py-5">
            <div className="mb-3 px-3 text-[10px] uppercase tracking-[0.28em] text-slate-500">Main Menu</div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-blue-500/15 text-blue-400"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="mt-6 px-3 text-[10px] uppercase tracking-[0.28em] text-slate-500">System</div>
            <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-400">
              Booking workspace connected
            </div>
          </div>

          <div className="mt-auto border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
                {session.user.fullName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "ST"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{session.user.fullName}</div>
                <div className="truncate text-[11px] text-slate-400">{session.user.email}</div>
              </div>
              <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                STAFF
              </span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-slate-200 p-1.5 text-slate-700">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                <div className="text-[11px] text-blue-700/80">{subtitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                <BellIcon className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
