import StaffPageLayout from "./StaffPageLayout";
import { useStaffBooking } from "@/hooks/useStaffBooking";

export default function StaffProfilePage() {
  const { session, bookings } = useStaffBooking();

  if (!session) {
    return null;
  }

  return (
    <StaffPageLayout
      title="Profile"
      subtitle="Staff Booking Operations"
      currentBookingCount={bookings.length}
    >
      <div className="flex min-h-full flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Profile
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Keep your staff profile details current and accurate.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Account</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Active</div>
            <div className="mt-2 text-sm text-slate-500">Staff access enabled</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Verification</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Complete</div>
            <div className="mt-2 text-sm text-slate-500">Email confirmed</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Role</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Staff</div>
            <div className="mt-2 text-sm text-slate-500">Current dashboard access</div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2 xl:col-span-1">
            <div className="text-lg font-semibold text-slate-900">Profile summary</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>Email: {session.user.email}</div>
              <div>Name: {session.user.fullName}</div>
              <div>Role: {session.user.role}</div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Account status</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">JWT secured session with booking access enabled.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Quick settings</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">This area can later hold profile settings and preferences.</p>
          </article>
        </section>
      </div>
    </StaffPageLayout>
  );
}
