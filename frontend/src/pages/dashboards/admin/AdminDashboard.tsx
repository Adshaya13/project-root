import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bus, CalendarCheck, LogOut, MapPin, Shield, Ticket, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/auth";
import type { DashboardData } from "@/types/auth";

const routeData = [
  { route: "Main Campus -> Library", riders: 520 },
  { route: "Dorm A -> Science", riders: 410 },
  { route: "Stadium -> Main", riders: 380 },
  { route: "Medical -> Engineering", riders: 290 },
];

const recentBookings = [
  { id: "BK-001", student: "Sarah Johnson", route: "Main Campus -> Library", time: "08:30 AM", status: "confirmed" },
  { id: "BK-002", student: "Mike Chen", route: "Dorm A -> Science Block", time: "09:15 AM", status: "pending" },
  { id: "BK-003", student: "Emily Davis", route: "Stadium -> Main Gate", time: "10:00 AM", status: "confirmed" },
  { id: "BK-004", student: "James Wilson", route: "Medical -> Engineering", time: "10:45 AM", status: "cancelled" },
  { id: "BK-005", student: "Lisa Park", route: "Library -> Dorm B", time: "11:30 AM", status: "confirmed" },
];

const statusTone: Record<string, string> = {
  confirmed: "text-emerald-300 border-emerald-400/35 bg-emerald-400/10",
  pending: "text-amber-300 border-amber-400/35 bg-amber-400/10",
  cancelled: "text-rose-300 border-rose-400/35 bg-rose-400/10",
};

export default function AdminDashboard() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!session || session.user.role !== "admin") {
        return;
      }

      try {
        setLoading(true);
        const data = await authApi.getDashboard(session.token, "admin");
        setDashboard(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [session]);

  if (!session || session.user.role !== "admin") {
    return <Navigate to="/?view=login" replace />;
  }

  if (loading || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="rounded-3xl border border-white/10 bg-white/6 px-6 py-5 text-sm backdrop-blur-xl">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.9),_rgba(2,6,23,1)_55%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/6 px-6 py-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">
                  Administrator
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  JWT secured
                </span>
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Dashboard</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">Campus bus operations overview</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</div>
                <div className="text-sm font-semibold text-white">{session.user.fullName}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/?view=login", { replace: true });
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12 hover:border-red-400/30"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
            <Users className="h-5 w-5 text-cyan-200" />
            <div className="mt-3 text-sm text-slate-300">Total Users</div>
            <div className="mt-1 font-display text-4xl font-semibold text-white">2,847</div>
            <div className="mt-1 text-sm text-slate-400">+12% this month</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
            <Bus className="h-5 w-5 text-emerald-200" />
            <div className="mt-3 text-sm text-slate-300">Active Buses</div>
            <div className="mt-1 font-display text-4xl font-semibold text-white">18</div>
            <div className="mt-1 text-sm text-slate-400">3 under maintenance</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
            <CalendarCheck className="h-5 w-5 text-amber-200" />
            <div className="mt-3 text-sm text-slate-300">Today Bookings</div>
            <div className="mt-1 font-display text-4xl font-semibold text-white">342</div>
            <div className="mt-1 text-sm text-slate-400">+8% vs yesterday</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
            <Ticket className="h-5 w-5 text-rose-200" />
            <div className="mt-3 text-sm text-slate-300">Open Tickets</div>
            <div className="mt-1 font-display text-4xl font-semibold text-white">23</div>
            <div className="mt-1 text-sm text-slate-400">-5 from last week</div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Weekly ridership trend</h3>
                <p className="text-sm text-slate-400">Bookings and riders this week</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[58, 72, 66, 84, 79, 44, 36].map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end rounded-xl border border-white/10 bg-slate-950/30 p-2">
                    <div className="w-full rounded-md bg-gradient-to-t from-cyan-500/80 to-emerald-400/80" style={{ height: `${value}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-200" />
              <h3 className="text-base font-semibold text-white">Top routes</h3>
            </div>
            <div className="space-y-3">
              {routeData.map((item) => (
                <div key={item.route} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <div className="text-sm text-slate-200">{item.route}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.riders} riders today</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
          <h3 className="mb-4 text-base font-semibold text-white">Recent bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Route</th>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/5 text-slate-200 last:border-b-0">
                    <td className="px-3 py-3 font-medium text-cyan-200">{booking.id}</td>
                    <td className="px-3 py-3">{booking.student}</td>
                    <td className="px-3 py-3 text-slate-300">{booking.route}</td>
                    <td className="px-3 py-3 text-slate-300">{booking.time}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${statusTone[booking.status]}`}>{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
