import { useState, useMemo, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, MapPinned, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import StaffPageLayout from "./StaffPageLayout";
import { useStaffBooking } from "@/hooks/useStaffBooking";
import { bookingApi } from "@/services/bookings";

const typeLabel: Record<string, string> = {
  SPACE: "Space",
  EQUIPMENT: "Equipment",
};

export default function StaffBookResourcePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, resources, setBookings } = useStaffBooking();
  const [selectedResourceId, setSelectedResourceId] = useState<number | "">("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const state = location.state as {
      selectedResourceId?: number;
      bookingDate?: string;
      startTime?: string;
      endTime?: string;
    } | null;

    if (state?.selectedResourceId) {
      setSelectedResourceId(state.selectedResourceId);
    }

    if (state?.bookingDate) {
      setBookingDate(state.bookingDate);
    }

    if (state?.startTime) {
      setStartTime(state.startTime);
    }

    if (state?.endTime) {
      setEndTime(state.endTime);
    }
  }, [location.state]);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedResourceId) ?? null,
    [resources, selectedResourceId],
  );

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

  const resourceOptions = visibleResources;

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedResourceId) {
      toast.error("Select a resource before booking");
      return;
    }

    if (!session) {
      toast.error("Session expired");
      return;
    }

    try {
      setSubmitting(true);
      const created = await bookingApi.createBooking(session.token, {
        resourceId: Number(selectedResourceId),
        bookingDate,
        startTime,
        endTime,
        purpose,
        attendees,
      });

      setBookings((current) => [created, ...current]);
      toast.success("Booking requested successfully");
      navigate("/dashboard/staff/my-bookings");
      setPurpose("");
      setStartTime("");
      setEndTime("");
      setAttendees(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create booking");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <StaffPageLayout
      title="Book Resource"
      subtitle="Staff Booking Operations"
    >
      <div className="flex min-h-full flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Book Resource
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Start a new booking request for a room, vehicle, or other shared campus resource.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Request type</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">New booking</div>
            <div className="mt-2 text-sm text-slate-500">Select a resource and time</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Approval path</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Staff queue</div>
            <div className="mt-2 text-sm text-slate-500">Submit for review</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Status</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Draft ready</div>
            <div className="mt-2 text-sm text-slate-500">Save and continue later</div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              <PlusCircle className="h-4 w-4 text-blue-500" />
              Booking form
            </div>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleBookingSubmit}>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm text-slate-600">Resource</span>
                <select
                  value={selectedResourceId}
                  onChange={(event) => setSelectedResourceId(Number(event.target.value) || "")}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                >
                  <option value="">Select a resource</option>
                  {resourceOptions.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} - {typeLabel[resource.category]}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm text-slate-600">Date</span>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-slate-600">Attendees</span>
                <input
                  type="number"
                  min={1}
                  value={attendees}
                  onChange={(event) => setAttendees(Number(event.target.value))}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-slate-600">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-slate-600">End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                  required
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm text-slate-600">Purpose</span>
                <textarea
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-300"
                  placeholder="Describe why you need the resource"
                  required
                />
              </label>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  The request will be sent as <span className="text-slate-900">PENDING</span> for review.
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CalendarDays className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Request Booking"}
                </button>
              </div>
            </form>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              <MapPinned className="h-4 w-4 text-blue-500" />
              Selected resource
            </div>
            {selectedResource ? (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xl font-semibold text-slate-900">{selectedResource.name}</div>
                <div className="mt-2 text-sm text-slate-600">{selectedResource.location}</div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-600">
                  <span className="rounded-full border border-slate-300 bg-white px-3 py-1">
                    {typeLabel[selectedResource.category]}
                  </span>
                  <span className="rounded-full border border-slate-300 bg-white px-3 py-1">
                    {selectedResource.type}
                  </span>
                  <span className="rounded-full border border-slate-300 bg-white px-3 py-1">
                    Capacity {selectedResource.capacity}
                  </span>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  You can pre-fill the booking request from the availability page using Book Now.
                </div>
              </div>
            ) : (
              <div className="mt-5 text-sm text-slate-500">Select a resource to see its details.</div>
            )}
          </article>
        </section>
      </div>
    </StaffPageLayout>
  );
}
