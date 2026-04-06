import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  ChevronRight,
  CircleAlert,
  Clock3,
  FolderKanban,
  Globe2,
  GraduationCap,
  KeyRound,
  LogOut,
  Mail,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  UserSquare2,
  UserX,
} from "lucide-react";
import type { DashboardData } from "@/types/auth";

interface AdminDashboardShellProps {
  dashboard: DashboardData;
  userName: string;
  onLogout: () => void;
}

type AdminUserRole = "admin" | "student" | "staff";
type UserStatus = "active" | "pending" | "suspended";

interface ManagedUser {
  id: number;
  fullName: string;
  email: string;
  role: AdminUserRole;
  status: UserStatus;
  phone: string;
  verification: string;
  source: string;
  lastActive: string;
}

const sidebarItems = [
  { id: "overview", label: "Overview", icon: FolderKanban },
  { id: "users", label: "User management", icon: Users },
  { id: "approvals", label: "Approvals", icon: BadgeCheck },
  { id: "audit", label: "Audit log", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: UserCog },
];

const users: ManagedUser[] = [
  {
    id: 1,
    fullName: "Amina Yusuf",
    email: "amina.yusuf@campusflow.edu",
    role: "student",
    status: "active",
    phone: "+1 555 014 118",
    verification: "Email verified",
    source: "Portal sign-up",
    lastActive: "2 min ago",
  },
  {
    id: 2,
    fullName: "Dr. Morgan Lee",
    email: "morgan.lee@campusflow.edu",
    role: "staff",
    status: "active",
    phone: "+1 555 014 204",
    verification: "Google linked",
    source: "Google sign-in",
    lastActive: "18 min ago",
  },
  {
    id: 3,
    fullName: "Samuel Okafor",
    email: "samuel.okafor@campusflow.edu",
    role: "student",
    status: "pending",
    phone: "+1 555 014 312",
    verification: "Awaiting OTP",
    source: "Registration queue",
    lastActive: "1 hour ago",
  },
  {
    id: 4,
    fullName: "Tara Mensah",
    email: "tara.mensah@campusflow.edu",
    role: "staff",
    status: "active",
    phone: "+1 555 014 427",
    verification: "Email verified",
    source: "HR import",
    lastActive: "Today",
  },
  {
    id: 5,
    fullName: "Noah Carter",
    email: "noah.carter@campusflow.edu",
    role: "student",
    status: "suspended",
    phone: "+1 555 014 538",
    verification: "Access restricted",
    source: "Policy review",
    lastActive: "Yesterday",
  },
  {
    id: 6,
    fullName: "Helena Brooks",
    email: "helena.brooks@campusflow.edu",
    role: "staff",
    status: "pending",
    phone: "+1 555 014 611",
    verification: "Needs review",
    source: "Department invite",
    lastActive: "3 hours ago",
  },
];

const roleTone: Record<AdminUserRole, string> = {
  admin: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/25",
  student: "bg-sky-400/15 text-sky-200 ring-1 ring-sky-300/25",
  staff: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/25",
};

const statusTone: Record<UserStatus, string> = {
  active: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/25",
  pending: "bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/25",
  suspended: "bg-rose-400/15 text-rose-100 ring-1 ring-rose-300/25",
};

const statusIcon: Record<UserStatus, typeof ShieldCheck> = {
  active: ShieldCheck,
  pending: CircleAlert,
  suspended: UserX,
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminDashboardShell({ dashboard, userName, onLogout }: AdminDashboardShellProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          searchTerm.trim().length === 0 ||
          [user.fullName, user.email, user.phone, user.source, user.verification].some((value) =>
            value.toLowerCase().includes(searchTerm.toLowerCase()),
          );

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      }),
    [roleFilter, searchTerm, statusFilter],
  );

  const userTotals = useMemo(() => {
    const active = users.filter((user) => user.status === "active").length;
    const pending = users.filter((user) => user.status === "pending").length;
    const suspended = users.filter((user) => user.status === "suspended").length;
    const googleLinked = users.filter((user) => user.verification.toLowerCase().includes("google")).length;

    return { active, pending, suspended, googleLinked };
  }, []);

  const summaryCards = [
    ...dashboard.metrics,
    { label: "User inventory", value: `${users.length}`, helper: "Accounts in the directory" },
    { label: "Verified accounts", value: `${userTotals.active}`, helper: "Ready for full access" },
    { label: "Google-linked", value: `${userTotals.googleLinked}`, helper: "Connected providers" },
    { label: "Pending queue", value: `${userTotals.pending}`, helper: "Needs review or OTP" },
    { label: "Suspended", value: `${userTotals.suspended}`, helper: "Restricted until clearance" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(135deg,_#020617,_#08111f_60%,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/55 px-4 py-5 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-[320px] lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex h-full flex-col gap-6">
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.3)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-amber-300 text-slate-950 shadow-[0_12px_30px_rgba(234,179,8,0.25)]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Admin console</div>
                <div className="text-lg font-semibold text-white">CampusFlow</div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</div>
              <div className="mt-2 text-lg font-semibold text-white">{userName}</div>
              <div className="mt-1 text-sm text-slate-300">Administrator</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <div className="text-slate-400">Active</div>
                  <div className="mt-1 font-semibold text-white">{userTotals.active}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <div className="text-slate-400">Pending</div>
                  <div className="mt-1 font-semibold text-white">{userTotals.pending}</div>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const active = index === 1;

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${active ? "border-secondary/35 bg-secondary/12 text-white shadow-[0_10px_35px_rgba(234,179,8,0.12)]" : "border-white/10 bg-slate-950/20 text-slate-300 hover:border-white/20 hover:bg-white/8 hover:text-white"}`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${active ? "text-secondary" : "text-slate-400"}`} />
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </a>
                );
              })}
            </nav>

            <div className="mt-auto space-y-3 rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <BellRing className="h-4 w-4 text-secondary" />
                3 alerts need review
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Globe2 className="h-4 w-4 text-sky-300" />
                Multi-role access enabled
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/12"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-400">
                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-slate-200">{dashboard.title}</span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">Admin only</span>
                  </div>
                  <div className="max-w-3xl space-y-3">
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">User management with clear control and fast actions.</h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{dashboard.subtitle}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {dashboard.actions.map((action) => (
                    <a
                      key={action.label}
                      href={action.href}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm font-medium text-white transition hover:border-secondary/40 hover:bg-slate-950/45"
                    >
                      {action.label}
                      <ArrowRight className="h-4 w-4 text-secondary" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.header>

            <section id="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.05 }}
                  className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                >
                  <div className="text-sm text-slate-300">{metric.label}</div>
                  <div className="mt-3 font-display text-4xl font-semibold text-white">{metric.value}</div>
                  <div className="mt-2 text-sm text-slate-400">{metric.helper}</div>
                </motion.div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.08 }}
                className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
              >
                <div id="users" className="flex flex-col gap-5 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-300">
                      <UserSquare2 className="h-4 w-4 text-secondary" />
                      User management
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Search, filter, and manage every account from one panel.</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Filter by role or status, inspect verification state, and keep the onboarding pipeline moving without losing sight of who needs attention.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/12"
                    >
                      <UserCog className="h-4 w-4 text-secondary" />
                      Invite user
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-slate-950/45"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-sky-300" />
                      Bulk actions
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="relative block flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search users by name, email, phone, or source"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/35 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-secondary/40"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    {(["all", "admin", "student", "staff"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRoleFilter(role)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${roleFilter === role ? "bg-secondary text-slate-950" : "border border-white/10 bg-slate-950/30 text-slate-300 hover:border-white/20 hover:bg-white/8 hover:text-white"}`}
                      >
                        {role === "all" ? "All roles" : role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                  {(["all", "active", "pending", "suspended"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full px-3 py-1.5 transition ${statusFilter === status ? "bg-white text-slate-950" : "border border-white/10 bg-slate-950/25 text-slate-300 hover:border-white/20 hover:bg-white/8"}`}
                    >
                      {status === "all" ? "All status" : status}
                    </button>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/30">
                  <div className="hidden grid-cols-[1.5fr_0.8fr_0.9fr_1.1fr_1fr_0.9fr] gap-4 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.24em] text-slate-400 xl:grid">
                    <div>User</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Verification</div>
                    <div>Last active</div>
                    <div className="text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-white/10">
                    {filteredUsers.map((user) => {
                      const StatusIcon = statusIcon[user.status];

                      return (
                        <motion.div
                          key={user.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22 }}
                          className="grid gap-4 px-5 py-4 xl:grid-cols-[1.5fr_0.8fr_0.9fr_1.1fr_1fr_0.9fr] xl:items-center"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white ring-1 ring-white/10">
                              {initials(user.fullName)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{user.fullName}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                                <Mail className="h-3.5 w-3.5 text-slate-500" />
                                {user.email}
                              </div>
                              <div className="mt-1 text-sm text-slate-500">{user.phone}</div>
                            </div>
                          </div>

                          <div>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${roleTone[user.role]}`}>
                              {user.role}
                            </span>
                          </div>

                          <div>
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusTone[user.status]}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {user.status}
                            </span>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-white">{user.verification}</div>
                            <div className="mt-1 text-sm text-slate-400">{user.source}</div>
                          </div>

                          <div className="text-sm text-slate-300">{user.lastActive}</div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-300 transition hover:border-white/20 hover:bg-white/12 hover:text-white"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-300 transition hover:border-white/20 hover:bg-white/12 hover:text-white"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">No users match the current filters.</div>
                  )}
                </div>
              </motion.div>

              <div className="space-y-6">
                <motion.section
                  id="approvals"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.12 }}
                  className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-300">
                    <BadgeCheck className="h-4 w-4 text-secondary" />
                    Pending approvals
                  </div>
                  <div className="mt-5 space-y-3">
                    {dashboard.announcements.map((announcement) => (
                      <div key={announcement} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-200">
                        {announcement}
                      </div>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  id="audit"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.16 }}
                  className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-300">
                    <Clock3 className="h-4 w-4 text-secondary" />
                    Recent activity
                  </div>
                  <div className="mt-5 space-y-4">
                    {[
                      { title: "5 student accounts verified", detail: "OTP checks completed successfully in the last hour." },
                      { title: "2 staff invites sent", detail: "Departments can onboard through Google or email verification." },
                      { title: "1 suspension reviewed", detail: "A restricted account is queued for manual review." },
                    ].map((item) => (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  id="settings"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.2 }}
                  className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    Admin shortcuts
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      { label: "Export user report", helper: "CSV, roles, and verification state" },
                      { label: "Reset session policies", helper: "Expire old JWT sessions across roles" },
                      { label: "Review Google accounts", helper: "Cross-check provider-linked users" },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.label}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-left transition hover:border-secondary/35 hover:bg-slate-950/45"
                      >
                        <div>
                          <div className="font-medium text-white">{item.label}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-400">{item.helper}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </motion.section>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}