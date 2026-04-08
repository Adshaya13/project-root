import { Clock3, MapPinned } from "lucide-react";
import StaffPageLayout from "./StaffPageLayout";
import { useStaffBooking } from "@/hooks/useStaffBooking";
import { useNavigate } from "react-router-dom";

const typeLabel: Record<string, string> = {
  SPACE: "Space",
  EQUIPMENT: "Equipment",
};

export default function StaffDashboardPage() {
  const navigate = useNavigate();
  const { bookings, visibleResources, dashboardStats, loading } = useStaffBooking();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm shadow-sm">
          Loading staff booking portal...
        </div>
      </div>
    );
  }

  const handleBookNow = (resourceId: number) => {
    navigate("/dashboard/staff/book-resource", { state: { selectedResourceId: resourceId } });
  };

  return (
    <StaffPageLayout
      title="Staff Dashboard"
      subtitle="Staff Booking Operations"
      currentBookingCount={bookings.length}
    >
      <div className="flex min-h-full flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  Staff Member
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                  <svg className="mr-1 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  JWT secured
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Staff Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Browse resources, create bookings, and manage your own requests from one dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {dashboardStats.map((card) => (
            <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">{card.label}</div>
              <div className="mt-3 font-display text-4xl font-semibold text-slate-900">{card.value}</div>
              <div className="mt-2 text-sm text-slate-500">{card.hint}</div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              <Clock3 className="h-4 w-4 text-blue-500" />
              Recent bookings
            </div>
            <div className="mt-5 space-y-3">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{booking.resource.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {booking.bookingDate} · {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      booking.status === "PENDING" ? "border-amber-200 bg-amber-100 text-amber-700" :
                      booking.status === "APPROVED" ? "border-emerald-200 bg-emerald-100 text-emerald-700" :
                      booking.status === "REJECTED" ? "border-rose-200 bg-rose-100 text-rose-700" :
                      "border-slate-200 bg-slate-100 text-slate-700"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <div className="text-sm text-slate-500">No bookings yet.</div>}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              <MapPinned className="h-4 w-4 text-blue-500" />
              Resource snapshot
            </div>
            <div className="mt-5 space-y-3">
              {visibleResources.slice(0, 4).map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => handleBookNow(resource.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-slate-100"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{resource.name}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {resource.location} · {typeLabel[resource.category]} · {resource.capacity} seats
                    </div>
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    Book Now
                  </span>
                </button>
              ))}
            </div>
          </article>
        </section>
      </div>
    </StaffPageLayout>
  );
}
