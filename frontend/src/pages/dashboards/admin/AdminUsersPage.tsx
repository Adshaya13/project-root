import { useEffect, useMemo, useState } from "react";
import { ShieldBan, ShieldCheck, Trash2, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import AdminPageLayout from "./AdminPageLayout";
import { useAuth } from "@/context/AuthContext";
import { adminApi, type AdminUserRecord } from "@/services/admin";

const roleTone: Record<string, string> = {
  admin: "text-amber-700 border-amber-200 bg-amber-50",
  student: "text-blue-700 border-blue-200 bg-blue-50",
  staff: "text-emerald-700 border-emerald-200 bg-emerald-50",
};

const statusTone: Record<string, string> = {
  active: "text-emerald-700 border-emerald-200 bg-emerald-50",
  restricted: "text-rose-700 border-rose-200 bg-rose-50",
};

function normalizeRole(role: string) {
  return role.toLowerCase();
}

function normalizeStatus(user: AdminUserRecord) {
  return user.enabled ? "active" : "restricted";
}

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "student" | "staff">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "restricted">("all");

  useEffect(() => {
    const loadUsers = async () => {
      if (!session) {
        return;
      }

      try {
        setLoading(true);
        const data = await adminApi.listUsers(session.token);
        setUsers(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load users");
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, [session]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const status = normalizeStatus(user);
      const matchesSearch =
        query.length === 0 ||
        [user.fullName, user.email, user.phone, user.gender, user.role].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesRole = roleFilter === "all" || normalizeRole(user.role) === roleFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  const activeCount = users.filter((user) => user.enabled).length;
  const restrictedCount = users.filter((user) => !user.enabled).length;
  const adminCount = users.filter((user) => normalizeRole(user.role) === "admin").length;

  const handleToggleRestriction = async (user: AdminUserRecord) => {
    if (!session) {
      return;
    }

    try {
      const nextEnabled = !user.enabled;
      const updated = await adminApi.setUserEnabled(session.token, user.id, nextEnabled);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(`${updated.fullName} has been ${nextEnabled ? "reactivated" : "restricted"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user status");
    }
  };

  const handleDeleteUser = async (user: AdminUserRecord) => {
    if (!session) {
      return;
    }

    if (!window.confirm(`Delete ${user.fullName}? This cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.deleteUser(session.token, user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.success(`${user.fullName} has been deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete user");
    }
  };

  return (
    <AdminPageLayout title="User Management" subtitle="Manage student, staff, and admin accounts from one place.">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{users.length}</div>
            <div className="mt-1 text-sm text-slate-500">Total users</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{activeCount}</div>
            <div className="mt-1 text-sm text-slate-500">Active users</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <ShieldBan className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{restrictedCount}</div>
            <div className="mt-1 text-sm text-slate-500">Restricted</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{adminCount}</div>
            <div className="mt-1 text-sm text-slate-500">Admin accounts</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone, or role"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "admin", "student", "staff"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  roleFilter === role ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {role === "all" ? "All roles" : role}
              </button>
            ))}
            {(["all", "active", "restricted"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  statusFilter === status ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {status === "all" ? "All status" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : null}
                {filteredUsers.map((user) => {
                  const roleKey = normalizeRole(user.role);
                  const status = normalizeStatus(user);
                  const isSelf = session?.user.id === user.id;

                  return (
                    <tr key={user.id} className="border-b border-slate-100 text-slate-700 last:border-b-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{user.fullName}</div>
                        <div className="text-xs text-slate-500">#{user.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${roleTone[roleKey] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
                          {roleKey}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                      <td className="px-4 py-3 text-slate-600">{user.gender}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${statusTone[status]}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.emailVerified ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleRestriction(user)}
                            disabled={isSelf}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {user.enabled ? <ShieldBan className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            {user.enabled ? "Restrict" : "Reactivate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteUser(user)}
                            disabled={isSelf}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
