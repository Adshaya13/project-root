import { API_BASE_URL } from "@/utils/env";
import type {
  Booking,
  BookingCreateRequest,
  BookingDecisionRequest,
  Resource,
} from "@/types/booking";

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

function buildAvailabilityQuery(date?: string, startTime?: string, endTime?: string) {
  const query = new URLSearchParams();

  if (date) {
    query.set("date", date);
  }

  if (startTime) {
    query.set("startTime", startTime);
  }

  if (endTime) {
    query.set("endTime", endTime);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export const bookingApi = {
  listResources(token: string, params?: { date?: string; startTime?: string; endTime?: string }) {
    const query = buildAvailabilityQuery(params?.date, params?.startTime, params?.endTime);
    return request<Resource[]>(`/resources${query}`, token);
  },
  listMyBookings(token: string) {
    return request<Booking[]>("/bookings/my", token);
  },
  createBooking(token: string, payload: BookingCreateRequest) {
    return request<Booking>("/bookings", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  cancelBooking(token: string, id: number) {
    return request<Booking>(`/bookings/${id}/cancel`, token, {
      method: "PUT",
    });
  },
  approveBooking(token: string, id: number, payload: BookingDecisionRequest = {}) {
    return request<Booking>(`/bookings/${id}/approve`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  rejectBooking(token: string, id: number, payload: BookingDecisionRequest = {}) {
    return request<Booking>(`/bookings/${id}/reject`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};