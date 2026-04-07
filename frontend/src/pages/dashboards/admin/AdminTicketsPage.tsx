import { AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";
import AdminPageLayout from "./AdminPageLayout";

const tickets = [
  { id: "TK-301", subject: "Bus BUS-03 late departure", reporter: "Sarah Johnson", priority: "high", status: "open", created: "2h ago" },
  { id: "TK-302", subject: "Seat reservation not showing", reporter: "Mike Chen", priority: "medium", status: "in-progress", created: "4h ago" },
  { id: "TK-303", subject: "Wrong route displayed on app", reporter: "Emily Davis", priority: "high", status: "open", created: "5h ago" },
  { id: "TK-304", subject: "Request for weekend shuttle", reporter: "Amanda Lee", priority: "low", status: "resolved", created: "1d ago" },
];

const statusTone: Record<string, string> = {
  open: "text-sky-300 border-sky-400/40 bg-sky-400/10",
  "in-progress": "text-amber-300 border-amber-400/40 bg-amber-400/10",
  resolved: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
};

const priorityTone: Record<string, string> = {
  high: "text-rose-300 border-rose-400/40 bg-rose-400/10",
  medium: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  low: "text-slate-300 border-slate-400/30 bg-slate-600/20",
};

export default function AdminTicketsPage() {
  const openCount = tickets.filter((ticket) => ticket.status === "open").length;
  const inProgress = tickets.filter((ticket) => ticket.status === "in-progress").length;
  const resolved = tickets.filter((ticket) => ticket.status === "resolved").length;

  return (
    <AdminPageLayout title="Ticket Management" subtitle="Review support issues, prioritize blockers, and respond quickly.">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <AlertCircle className="h-5 w-5 text-sky-500" />
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{openCount}</div>
            <div className="mt-1 text-sm text-slate-500">Open tickets</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock className="h-5 w-5 text-amber-500" />
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{inProgress}</div>
            <div className="mt-1 text-sm text-slate-500">In progress</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{resolved}</div>
            <div className="mt-1 text-sm text-slate-500">Resolved</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-100 text-slate-700 last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{ticket.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{ticket.subject}</div>
                      <div className="text-xs text-slate-500">by {ticket.reporter}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${priorityTone[ticket.priority]}`}>{ticket.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${statusTone[ticket.status]}`}>{ticket.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{ticket.created}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                        <MessageSquare className="h-3.5 w-3.5" /> Reply
                      </button>
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
