export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type ResourceCategory = "SPACE" | "EQUIPMENT";

export type ResourceType =
  | "CLASSROOM"
  | "LECTURE_HALL"
  | "LAB"
  | "MEETING_ROOM"
  | "PROJECTOR"
  | "CAMERA"
  | "COMPUTER"
  | "AUDIO_SYSTEM";

export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  category: ResourceCategory;
  location: string;
  capacity: number;
  active: boolean;
  bookable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingUser {
  id: number;
  fullName: string;
  email: string;
  role: string | null;
}

export interface Booking {
  id: number;
  resource: Resource;
  requester: BookingUser;
  reviewedBy: BookingUser | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: BookingStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateRequest {
  resourceId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
}

export interface BookingDecisionRequest {
  note?: string;
}