import { CalendarCheck, Clock, Download, Filter } from "lucide-react";
import AdminPageLayout from "./AdminPageLayout";

const bookings = [
  { id: "BK-1001", student: "Sarah Johnson", route: "Main Campus -> Library", bus: "BUS-01", time: "08:30 AM", status: "confirmed" },
  { id: "BK-1002", student: "Mike Chen", route: "Dorm A -> Science Block", bus: "BUS-02", time: "09:15 AM", status: "pending" },
  { id: "BK-1003", student: "Emily Davis", route: "Stadium -> Main Gate", bus: "BUS-06", time: "10:00 AM", status: "confirmed" },
  { id: "BK-1004", student: "James Wilson", route: "Medical -> Engineering", bus: "BUS-04", time: "10:45 AM", status: "cancelled" },
  { id: "BK-1005", student: "Lisa Park", route: "Library -> Dorm B", bus: "BUS-01", time: "11:30 AM", status: "confirmed" },
];

const statusTone: Record<string, string> = {
  confirmed: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  pending: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  cancelled: "text-rose-300 border-rose-400/40 bg-rose-400/10",
};

export default function AdminBookingsPage() {
  const confirmed = bookings.filter((item) => item.status === "confirmed").length;

  return (
    <AdminPageLayout title="Booking Management" subtitle="Track ride demand, booking states, and operational flow.">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarCheck className="h-5 w-5 text-blue-500" />
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{bookings.length}</div>
            <div className="mt-1 text-sm text-slate-500">Total bookings today</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock className="h-5 w-5 text-emerald-500" />
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{confirmed}</div>
            <div className="mt-1 text-sm text-slate-500">Confirmed rides</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Filter className="h-5 w-5 text-amber-500" />
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{bookings.length - confirmed}</div>
            <div className="mt-1 text-sm text-slate-500">Pending or cancelled</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Bus</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 text-slate-700 last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{booking.id}</td>
                    <td className="px-4 py-3">{booking.student}</td>
                    <td className="px-4 py-3 text-slate-500">{booking.route}</td>
                    <td className="px-4 py-3">{booking.bus}</td>
                    <td className="px-4 py-3 text-slate-500">{booking.time}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${statusTone[booking.status]}`}>{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
