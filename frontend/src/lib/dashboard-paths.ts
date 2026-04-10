import type { Role } from "@/types/auth";

const rolePathMap: Record<Role, string> = {
  admin: "/dashboard/admin",
  user: "/dashboard/user",
  technician: "/dashboard/technician",
};

export function getDashboardPath(role: Role): string {
  return rolePathMap[role] ?? "/";
}
