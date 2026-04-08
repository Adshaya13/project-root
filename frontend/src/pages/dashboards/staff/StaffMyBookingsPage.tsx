import { BookOpen, XCircle } from "lucide-react";
import StaffPageLayout from "./StaffPageLayout";
import { useStaffBooking } from "@/hooks/useStaffBooking";

const typeLabel: Record<string, string> = {
  SPACE: "Space",
  EQUIPMENT: "Equipment",
};

const statusTone: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-100 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-100 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-100 text-rose-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-700",
};

function formatTime(value: string) {
  return value.slice(0, 5);
}

function isFinalStatus(status: string) {
  return status === "CANCELLED" || status === "REJECTED";
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export default function StaffMyBookingsPage() {
  const { bookings, handleCancelBooking } = useStaffBooking();
  const now = new Date();
  const todayKey = toLocalDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const inProgressCount = bookings.filter((booking) => {
    if (booking.status !== "APPROVED" || booking.bookingDate !== todayKey) {
      return false;
    }

    const startMinutes = timeToMinutes(booking.startTime);
    const endMinutes = timeToMinutes(booking.endTime);
    return startMinutes <= nowMinutes && nowMinutes < endMinutes;
  }).length;

  const upcomingCount = bookings.filter((booking) => {
    if (booking.status !== "APPROVED") {
      return false;
    }

    if (booking.bookingDate > todayKey) {
      return true;
    }

    if (booking.bookingDate < todayKey) {
      return false;
    }

    return timeToMinutes(booking.startTime) > nowMinutes;
  }).length;

  const awaitingActionCount = bookings.filter((booking) => booking.status === "PENDING").length;

  return (
    <StaffPageLayout
      title="My Bookings"
      subtitle="Staff Booking Operations"
      currentBookingCount={bookings.length}
    >
      <div className="flex min-h-full flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                My Bookings
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                See all active reservations you submitted and manage them from one screen.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Upcoming</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">{String(upcomingCount).padStart(2, "0")}</div>
            <div className="mt-2 text-sm text-slate-500">Scheduled reservations</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">In progress</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">{String(inProgressCount).padStart(2, "0")}</div>
            <div className="mt-2 text-sm text-slate-500">Currently active</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Awaiting action</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">{String(awaitingActionCount).padStart(2, "0")}</div>
            <div className="mt-2 text-sm text-slate-500">Needs your response</div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            <BookOpen className="h-4 w-4 text-blue-500" />
            My bookings
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-3">Resource</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Purpose</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 text-slate-700 last:border-b-0">
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{booking.resource.name}</div>
                      <div className="text-xs text-slate-500">{typeLabel[booking.resource.category]}</div>
                    </td>
                    <td className="px-3 py-3">{booking.bookingDate}</td>
                    <td className="px-3 py-3">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{booking.purpose}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {!isFinalStatus(booking.status) ? (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="py-8 text-sm text-slate-500">No bookings found.</div>
            )}
          </div>
        </section>
      </div>
    </StaffPageLayout>
  );
}
