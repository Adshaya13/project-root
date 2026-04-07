import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Bell,
  Bus,
  CalendarCheck,
  LayoutDashboard,
  MapPin,
  Package,
  Search,
  Settings,
  Ticket,
  TrendingUp,
  Users,
  LogOut as LogOutIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const chartData = [
  { name: "Mon", bookings: 120, riders: 340 },
  { name: "Tue", bookings: 180, riders: 420 },
  { name: "Wed", bookings: 150, riders: 380 },
  { name: "Thu", bookings: 210, riders: 500 },
  { name: "Fri", bookings: 190, riders: 460 },
  { name: "Sat", bookings: 80, riders: 180 },
  { name: "Sun", bookings: 60, riders: 120 },
];

const routeData = [
  { route: "Main Campus -> Library", riders: 520 },
  { route: "Dorm A -> Science", riders: 410 },
  { route: "Stadium -> Main", riders: 380 },
  { route: "Medical -> Eng.", riders: 290 },
];

const recentBookings = [
  { id: "BK-001", student: "Sarah Johnson", route: "Main Campus -> Library", time: "08:30 AM", status: "confirmed" },
  { id: "BK-002", student: "Mike Chen", route: "Dorm A -> Science Block", time: "09:15 AM", status: "pending" },
  { id: "BK-003", student: "Emily Davis", route: "Stadium -> Main Gate", time: "10:00 AM", status: "confirmed" },
  { id: "BK-004", student: "James Wilson", route: "Medical -> Engineering", time: "10:45 AM", status: "cancelled" },
  { id: "BK-005", student: "Lisa Park", route: "Library -> Dorm B", time: "11:30 AM", status: "confirmed" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-600 border-emerald-200",
  pending: "bg-amber-100 text-amber-600 border-amber-200",
  cancelled: "bg-rose-100 text-rose-600 border-rose-200",
};

const sidebarItems = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/dashboard/admin", end: true },
  { title: "User Management", icon: Users, to: "/dashboard/admin/users" },
  { title: "Resource Management", icon: Package, to: "/dashboard/admin/resources" },
  { title: "Booking Management", icon: CalendarCheck, to: "/dashboard/admin/bookings" },
  { title: "Ticket Management", icon: Ticket, to: "/dashboard/admin/tickets" },
];

export default function AdminDashboardPage() {
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
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.title}
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
                    <span>{item.title}</span>
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
                <LogOutIcon className="h-4 w-4" />
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
                <div className="text-sm font-semibold text-slate-900">Dashboard</div>
                <div className="text-[11px] text-blue-700/80">Campus Bus Operations Overview</div>
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

          <main className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
            <div className="space-y-6">
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Users</div>
                      <div className="mt-2 text-3xl font-extrabold text-slate-900">2,847</div>
                      <div className="mt-1 text-xs font-medium text-emerald-500">+12% this month</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Active Buses</div>
                      <div className="mt-2 text-3xl font-extrabold text-slate-900">18</div>
                      <div className="mt-1 text-xs font-medium text-slate-500">3 under maintenance</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <Bus className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Today&apos;s Bookings</div>
                      <div className="mt-2 text-3xl font-extrabold text-slate-900">342</div>
                      <div className="mt-1 text-xs font-medium text-emerald-500">+8% vs yesterday</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Open Tickets</div>
                      <div className="mt-2 text-3xl font-extrabold text-slate-900">23</div>
                      <div className="mt-1 text-xs font-medium text-emerald-500">-5 from last week</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <Ticket className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Weekly Ridership</div>
                      <div className="text-xs text-slate-500">Bookings & total riders this week</div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>

                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="ridersFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2d5bdb" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#2d5bdb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
                        <Tooltip
                          contentStyle={{
                            fontSize: 12,
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
                          }}
                        />
                        <Area type="monotone" dataKey="riders" stroke="#2d5bdb" fill="url(#ridersFill)" strokeWidth={2} />
                        <Area type="monotone" dataKey="bookings" stroke="#2aa6a1" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Top Routes</div>
                      <div className="text-xs text-slate-500">By ridership today</div>
                    </div>
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={routeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                        <YAxis dataKey="route" type="category" tick={{ fontSize: 9, fill: "#64748b" }} width={120} stroke="#cbd5e1" />
                        <Tooltip
                          contentStyle={{
                            fontSize: 12,
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
                          }}
                        />
                        <Bar dataKey="riders" fill="#2d5bdb" radius={[0, 6, 6, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-sm font-semibold text-slate-900">Recent Bookings</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left uppercase tracking-wider text-slate-500">
                        <th className="px-3 py-3">ID</th>
                        <th className="px-3 py-3">Student</th>
                        <th className="px-3 py-3">Route</th>
                        <th className="px-3 py-3">Time</th>
                        <th className="px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-mono font-semibold text-blue-700">{booking.id}</td>
                          <td className="px-3 py-2.5 font-medium text-slate-900">{booking.student}</td>
                          <td className="px-3 py-2.5 text-slate-500">{booking.route}</td>
                          <td className="px-3 py-2.5 text-slate-500">{booking.time}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${statusColors[booking.status]}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}