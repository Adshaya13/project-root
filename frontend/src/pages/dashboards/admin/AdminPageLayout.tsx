import type { ReactNode } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { Bell, Bus, CalendarCheck, LayoutDashboard, LogOut, Search, Settings, Ticket, Users, Wrench } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const navItems = [
  { to: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/admin/users", label: "Users", icon: Users },
  { to: "/dashboard/admin/resources", label: "Resources", icon: Wrench },
  { to: "/dashboard/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/dashboard/admin/tickets", label: "Tickets", icon: Ticket },
];

export default function AdminPageLayout({ title, subtitle, children }: AdminPageLayoutProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  if (!session || session.user.role !== "admin") {
    return <Navigate to="/?view=login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside className="flex w-[260px] shrink-0 flex-col bg-slate-950 text-slate-100 shadow-[0_16px_48px_rgba(15,23,42,0.35)]">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-white">CamBus Flow</div>
                <div className="text-xs text-slate-400">Admin Portal</div>
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
            <button
              type="button"
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Settings</span>
            </button>
          </div>

          <div className="mt-auto border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
                {session.user.fullName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "AD"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{session.user.fullName}</div>
                <div className="truncate text-[11px] text-slate-400">{session.user.email}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/?view=login", { replace: true });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
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

            <div className="flex items-center gap-3">
              <div className="relative hidden min-[800px]:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search..."
                  className="h-9 w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300"
                />
              </div>
              <button type="button" className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              </button>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
            <div className="min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
