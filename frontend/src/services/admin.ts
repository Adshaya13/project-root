import { API_BASE_URL } from "@/utils/env";

export interface AdminUserRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  enabled: boolean;
  emailVerified: boolean;
  googleAccount: boolean;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export const adminApi = {
  listUsers(token: string) {
    return request<AdminUserRecord[]>("/admin/users", token);
  },
  setUserEnabled(token: string, userId: number, enabled: boolean) {
    return request<AdminUserRecord>(`/admin/users/${userId}/enabled?enabled=${enabled}`, token, {
      method: "PATCH",
    });
  },
  deleteUser(token: string, userId: number) {
    return request<void>(`/admin/users/${userId}`, token, {
      method: "DELETE",
    });
  },
};