import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, CalendarDays, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import StaffPageLayout from "./StaffPageLayout";
import { useStaffBooking } from "@/hooks/useStaffBooking";
import { bookingApi } from "@/services/bookings";
import type { Resource } from "@/types/booking";

const typeLabel: Record<string, string> = {
  SPACE: "Space",
  EQUIPMENT: "Equipment",
};

export default function StaffResourceAvailabilityPage() {
  const navigate = useNavigate();
  const { session, resources } = useStaffBooking();
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityStartTime, setAvailabilityStartTime] = useState("");
  const [availabilityEndTime, setAvailabilityEndTime] = useState("");

  const eligibleResources = useMemo(() => {
    return resources.filter((resource) => {
      if (!resource.active || !resource.bookable) {
        return false;
      }

      if (session?.user.role === "staff") {
        return true;
      }

      return resource.category === "EQUIPMENT";
    });
  }, [resources, session]);

  const hasAnyFilter = Boolean(availabilityDate || availabilityStartTime || availabilityEndTime);
  const visiblePool = hasAnyFilter ? availableResources : eligibleResources;
  const displayedResources = hasAnyFilter ? availableResources : eligibleResources;
  const openSpacesCount = visiblePool.filter((resource) => resource.category === "SPACE").length;
  const openEquipmentCount = visiblePool.filter((resource) => resource.category === "EQUIPMENT").length;
  const blockedSlotCount = hasAnyFilter
    ? Math.max(eligibleResources.length - availableResources.length, 0)
    : 0;

  useEffect(() => {
    if (!availabilityDate && !availabilityStartTime && !availabilityEndTime) {
      setAvailableResources([]);
      return;
    }

    let cancelled = false;

    const loadAvailability = async () => {
      if (!session) return;
      try {
        setAvailabilityLoading(true);
        const resourceData = await bookingApi.listResources(session.token, {
          date: availabilityDate || undefined,
          startTime: availabilityStartTime || undefined,
          endTime: availabilityEndTime || undefined,
        });

        if (!cancelled) {
          setAvailableResources(resourceData);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load availability");
          setAvailableResources(eligibleResources);
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [availabilityDate, availabilityEndTime, availabilityStartTime, eligibleResources, session]);

  const handleBookNow = (resourceId: number) => {
    navigate("/dashboard/staff/book-resource", {
      state: {
        selectedResourceId: resourceId,
        bookingDate: availabilityDate,
        startTime: availabilityStartTime,
        endTime: availabilityEndTime,
      },
    });
  };

  return (
    <StaffPageLayout
      title="Resource Availability"
      subtitle="Staff Booking Operations"
    >
      <div className="flex min-h-full flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Resource Availability
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Check what is currently open before making a booking request.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Rooms open</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">{String(openSpacesCount).padStart(2, "0")}</div>
            <div className="mt-2 text-sm text-slate-500">{hasAnyFilter ? "From current filters" : "Currently bookable"}</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Equipment open</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">{String(openEquipmentCount).padStart(2, "0")}</div>
            <div className="mt-2 text-sm text-slate-500">{hasAnyFilter ? "From current filters" : "Currently bookable"}</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Blocked slots</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">{String(blockedSlotCount).padStart(2, "0")}</div>
            <div className="mt-2 text-sm text-slate-500">{hasAnyFilter ? "Unavailable resources" : "Add any filter to calculate"}</div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              <CalendarClock className="h-4 w-4 text-blue-500" />
              Check availability
            </div>
            <div className="mt-5 grid gap-4">
              <label>
                <span className="mb-2 block text-sm text-slate-600">Date</span>
                <input
                  type="date"
                  value={availabilityDate}
                  onChange={(event) => setAvailabilityDate(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-slate-600">Start time</span>
                  <input
                    type="time"
                    value={availabilityStartTime}
                    onChange={(event) => setAvailabilityStartTime(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-slate-600">End time</span>
                  <input
                    type="time"
                    value={availabilityEndTime}
                    onChange={(event) => setAvailabilityEndTime(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {availabilityLoading
                  ? "Checking availability for the selected slot..."
                  : "Use any filter (date/start/end time) to narrow available resources."}
              </div>
            </div>
          </article>

          <article className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {displayedResources.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{resource.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{resource.location}</div>
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    {typeLabel[resource.category]}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Free for the selected slot
                </div>

                <div className="mt-4 text-sm text-slate-600">
                  Type: {resource.type} · Capacity: {resource.capacity}
                </div>

                <button
                  type="button"
                  onClick={() => handleBookNow(resource.id)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <CalendarDays className="h-4 w-4" />
                  Book Now
                </button>
              </div>
            ))}
            {!availabilityLoading && hasAnyFilter && availableResources.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 md:col-span-2">
                No free resources match the current filters.
              </div>
            )}
            {!availabilityLoading && !hasAnyFilter && displayedResources.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 md:col-span-2">
                No currently bookable resources are available.
              </div>
            )}
          </article>
        </section>
      </div>
    </StaffPageLayout>
  );
}
