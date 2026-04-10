import { API_BASE_URL, APP_NAME } from "@/utils/env";
import type {
  AuthSession,
  DashboardData,
  ForgotPasswordRequest,
  GoogleAuthRequest,
  LoginRequest,
  OtpReceipt,
  ResetPasswordRequest,
  SignupRequest,
  VerifySignupRequest,
} from "@/types/auth";

const STORAGE_KEY = `${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-session`;

function normalizeRole(role: unknown): "admin" | "user" | "technician" {
  const normalized = String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/^role_/, "");
  if (normalized === "admin" || normalized === "user" || normalized === "technician") {
    return normalized;
  }

  return "user";
}

function normalizeSession(session: AuthSession): AuthSession {
  return {
    ...session,
    user: {
      ...session.user,
      role: normalizeRole(session.user.role),
    },
  };
}

function normalizeDashboard(data: DashboardData): DashboardData {
  return {
    ...data,
    role: normalizeRole(data.role),
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export const authStorage = {
  read(): AuthSession | null {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return normalizeSession(JSON.parse(raw) as AuthSession);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },
  write(session: AuthSession | null) {
    if (typeof window === "undefined") {
      return;
    }

    if (!session) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSession(session)));
  },
};

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const authApi = {
  login(payload: LoginRequest) {
    return request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(normalizeSession);
  },
  requestRegistrationOtp(payload: SignupRequest) {
    return request<OtpReceipt>("/auth/register/request-otp", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        role: payload.role.toUpperCase(),
      }),
    });
  },
  verifyRegistrationOtp(payload: VerifySignupRequest) {
    return request<AuthSession>("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(normalizeSession);
  },
  requestPasswordResetOtp(payload: ForgotPasswordRequest) {
    return request<OtpReceipt>("/auth/forgot-password/request-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  resetPassword(payload: ResetPasswordRequest) {
    return request<AuthSession>("/auth/forgot-password/reset", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(normalizeSession);
  },
  googleAuth(payload: GoogleAuthRequest) {
    return request<AuthSession>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        role: payload.role.toUpperCase(),
      }),
    }).then(normalizeSession);
  },
  getDashboard(token: string, role?: string) {
    const suffix = role ? `/dashboard/${role}` : "/dashboard/me";
    return request<DashboardData>(suffix, {
      method: "GET",
      headers: authHeaders(token),
    }).then(normalizeDashboard);
  },
};