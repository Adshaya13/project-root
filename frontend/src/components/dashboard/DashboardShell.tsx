import { LogOut, Shield, Sparkles } from "lucide-react";
import type { DashboardData, Role } from "@/types/auth";

interface DashboardShellProps {
  role: Role;
  dashboard: DashboardData;
  userName: string;
  onLogout: () => void;
}

const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  student: "Student",
  staff: "Staff member",
};

export function DashboardShell({ role, dashboard, userName, onLogout }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.9),_rgba(2,6,23,1)_55%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/6 px-6 py-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">{roleLabels[role]}</span>
                <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  JWT secured
                </span>
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{dashboard.title}</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{dashboard.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</div>
                <div className="text-sm font-semibold text-white">{userName}</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {dashboard.metrics.map((metric) => (
            <div key={metric.label} className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
              <div className="text-sm text-slate-300">{metric.label}</div>
              <div className="mt-3 font-display text-4xl font-semibold text-white">{metric.value}</div>
              <div className="mt-2 text-sm text-slate-400">{metric.helper}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-300">
              <Sparkles className="h-4 w-4 text-secondary" />
              Announcements
            </div>
            <div className="mt-5 space-y-4">
              {dashboard.announcements.map((announcement) => (
                <div key={announcement} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-200">
                  {announcement}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
            <div className="text-sm font-medium uppercase tracking-[0.24em] text-slate-300">Quick actions</div>
            <div className="mt-5 space-y-4">
              {dashboard.actions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="block rounded-2xl border border-white/10 bg-slate-950/30 p-4 transition hover:border-secondary/40 hover:bg-slate-950/45"
                >
                  <div className="text-base font-semibold text-white">{action.label}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-400">{action.description}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}