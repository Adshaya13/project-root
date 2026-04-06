import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_rgba(2,6,23,1)_60%)] px-4 text-slate-100">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/6 p-8 text-center backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
        <h1 className="font-display text-5xl font-semibold">404</h1>
        <p className="mt-4 text-lg text-slate-300">The route you requested does not exist.</p>
        <p className="mt-2 text-sm text-slate-400">{location.pathname}</p>
        <a href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
          Return to auth
        </a>
      </div>
    </div>
  );
}