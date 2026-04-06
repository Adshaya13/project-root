export type Role = "admin" | "student" | "staff";

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  role: Role;
  emailVerified: boolean;
  googleAccount: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: UserProfile;
  newlyCreated: boolean;
}

export interface OtpReceipt {
  message: string;
  email: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  role: Exclude<Role, "admin">;
  password: string;
}

export interface VerifySignupRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface GoogleAuthRequest {
  email: string;
  fullName: string;
  role?: Role;
  googleSubject?: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  helper: string;
}

export interface DashboardAction {
  label: string;
  description: string;
  href: string;
}

export interface DashboardData {
  role: Role;
  title: string;
  subtitle: string;
  metrics: DashboardMetric[];
  announcements: string[];
  actions: DashboardAction[];
}