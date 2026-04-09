export const getRoleDashboard = (role) => {
  switch (role) {
    case "USER":
      return "/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "TECHNICIAN":
      return "/technician/dashboard";
    default:
      return "/login";
  }
};

export const hasRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};
