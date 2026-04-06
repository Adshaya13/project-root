interface HeroCardProps {
  title: string;
  description: string;
}

export default function HeroCard({ title, description }: HeroCardProps) {
  return (
    <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-black/30 p-10 shadow-2xl backdrop-blur-md">
      <p className="mb-4 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
        Frontend File Structure Ready
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">{description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <span className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">components</span>
        <span className="rounded-lg bg-sky-500/20 px-3 py-2 text-sm text-sky-200">pages</span>
        <span className="rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200">services + utils</span>
      </div>
    </section>
  );
}
