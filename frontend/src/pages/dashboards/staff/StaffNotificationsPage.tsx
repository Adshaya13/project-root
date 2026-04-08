import StaffPageLayout from "./StaffPageLayout";

export default function StaffNotificationsPage() {
  return (
    <StaffPageLayout
      title="Notifications"
      subtitle="Staff Booking Operations"
    >
      <div className="flex min-h-full flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Notifications
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Read updates about approvals, reminders, and resource changes.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Unread</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">05</div>
            <div className="mt-2 text-sm text-slate-500">New alerts available</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Mentions</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">02</div>
            <div className="mt-2 text-sm text-slate-500">Action required</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Reminders</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">04</div>
            <div className="mt-2 text-sm text-slate-500">Upcoming booking notices</div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { title: "Booking reminder", body: "Upcoming bookings appear here as reminders." },
            { title: "Approval updates", body: "Approval or rejection notifications will appear here." },
            { title: "Resource changes", body: "Resource availability changes can be surfaced here later." },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-slate-900">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </section>
      </div>
    </StaffPageLayout>
  );
}
