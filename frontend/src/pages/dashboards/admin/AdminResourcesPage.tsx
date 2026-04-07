import { Bus, Fuel, MapPin, Wrench } from "lucide-react";
import AdminPageLayout from "./AdminPageLayout";

const buses = [
  { id: "BUS-01", route: "Main Campus Loop", driver: "John Smith", fuel: 82, status: "active" },
  { id: "BUS-02", route: "Dorm Express", driver: "Maria Garcia", fuel: 65, status: "active" },
  { id: "BUS-03", route: "Science Park Shuttle", driver: "David Brown", fuel: 40, status: "maintenance" },
  { id: "BUS-04", route: "Medical Center", driver: "Nancy White", fuel: 91, status: "active" },
  { id: "BUS-05", route: "Unassigned", driver: "-", fuel: 100, status: "inactive" },
];

const statusTone: Record<string, string> = {
  active: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  maintenance: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  inactive: "text-slate-300 border-slate-400/30 bg-slate-600/20",
};

export default function AdminResourcesPage() {
  return (
    <AdminPageLayout title="Resource Management" subtitle="Monitor fleet status, route assignments, and maintenance readiness.">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {buses.map((bus) => (
          <article key={bus.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">{bus.id}</div>
                  <div className="text-base font-semibold text-slate-900">{bus.route}</div>
                </div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs ${statusTone[bus.status]}`}>{bus.status}</span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />Driver: {bus.driver}</p>
              <p className="inline-flex items-center gap-2"><Fuel className="h-4 w-4 text-slate-400" />Fuel: {bus.fuel}%</p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${bus.fuel}%` }} />
            </div>
          </article>
        ))}

        <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-slate-600 shadow-sm">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Wrench className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Maintenance Queue</h3>
          <p className="mt-2 text-sm">1 bus is currently under maintenance. Schedule preventive checks to avoid route disruption.</p>
        </article>
      </div>
    </AdminPageLayout>
  );
}
