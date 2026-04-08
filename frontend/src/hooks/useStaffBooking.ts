import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { bookingApi } from "@/services/bookings";
import type { Booking, Resource } from "@/types/booking";

export function useStaffBooking() {
  const { session } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!session) return;
      try {
        setLoading(true);
        const [resourceData, bookingData] = await Promise.all([
          bookingApi.listResources(session.token),
          bookingApi.listMyBookings(session.token),
        ]);

        setResources(resourceData);
        setBookings(bookingData);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load booking data");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [session?.token]);

  const visibleResources = useMemo(() => {
    if (!session) return [];
    const role = session.user.role;
    return resources.filter((resource) => {
      if (!resource.active || !resource.bookable) {
        return false;
      }

      if (role === "staff") {
        return true;
      }

      return resource.category === "EQUIPMENT";
    });
  }, [resources, session]);

  const dashboardStats = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === "PENDING").length;
    const approved = bookings.filter((booking) => booking.status === "APPROVED").length;
    const cancelled = bookings.filter((booking) => booking.status === "CANCELLED").length;

    return [
      { label: "My bookings", value: String(bookings.length).padStart(2, "0"), hint: "All requests in one place" },
      { label: "Pending bookings", value: String(pending).padStart(2, "0"), hint: "Awaiting decisions" },
      { label: "Approved bookings", value: String(approved).padStart(2, "0"), hint: "Confirmed reservations" },
      { label: "Cancelled bookings", value: String(cancelled).padStart(2, "0"), hint: "Owner cancelled requests" },
    ];
  }, [bookings]);

  const bookingHistory = useMemo(() => bookings.filter((booking) => booking.status !== "PENDING"), [bookings]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!session) return;
    try {
      const updated = await bookingApi.cancelBooking(session.token, bookingId);
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)));
      toast.success("Booking cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel booking");
    }
  };

  return {
    session,
    resources,
    bookings,
    setBookings,
    loading,
    visibleResources,
    dashboardStats,
    bookingHistory,
    handleCancelBooking,
  };
}
