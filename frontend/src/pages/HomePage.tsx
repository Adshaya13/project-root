import HeroCard from "../components/layout/HeroCard";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16 text-slate-100">
      <HeroCard
        title="Project structure organized"
        description="Your frontend now follows components, pages, context, services, types, and utils folders."
      />
    </main>
  );
}
