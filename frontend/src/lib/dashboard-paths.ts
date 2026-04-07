import type { Role } from "@/types/auth";

const rolePathMap: Record<Role, string> = {
  admin: "/dashboard/admin",
  staff: "/dashboard/staff",
  student: "/dashboard/student",
};

export function getDashboardPath(role: Role): string {
  return rolePathMap[role] ?? "/";
}
