import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, GraduationCap, Shield, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { BrandMark } from "@/components/layout/BrandMark";
import { useAuth } from "@/context/AuthContext";

type AuthView = "login" | "register" | "forgot";

export default function Index() {
  const [view, setView] = useState<AuthView>("login");
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate(`/dashboard/${session.user.role}`, { replace: true });
    }
  }, [navigate, session]);

  const roleCards = [
    {
      role: "admin",
      title: "Admin dashboard",
      copy: "Manage users, approvals, and policy controls from one place.",
      icon: Shield,
    },
    {
      role: "student",
      title: "Student dashboard",
      copy: "Track courses, attendance, and announcements in a clean workspace.",
      icon: Users,
    },
    {
      role: "staff",
      title: "Staff dashboard",
      copy: "Handle teaching, approvals, and department updates without friction.",
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_34%),linear-gradient(135deg,_#020617,_#0f172a_55%,_#111827)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.22)] md:flex">
            <Sparkles className="h-4 w-4 text-secondary" />
            JWT, OTP, Google auth, and three role dashboards
          </div>
        </div>

        <div className="auth-grid flex-1 items-center gap-8 py-8 lg:py-12">
          <section className="space-y-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300">
                <GraduationCap className="h-3.5 w-3.5 text-secondary" />
                Role-based access model
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                One auth stack for admin, student, and staff dashboards.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Students and staff register with six-digit email OTP verification, every session is issued as JWT,
                password reset follows the same secure pattern, and Google sign-in is wired into the same identity layer.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {roleCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.role}
                    className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(2,6,23,0.35)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-secondary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{card.copy}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(2,6,23,0.45)]">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Registration</div>
                  <div className="mt-2 text-sm leading-6 text-slate-200">Email OTP for students and staff, then instant JWT session on verification.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Password reset</div>
                  <div className="mt-2 text-sm leading-6 text-slate-200">Request a code, verify it, and set a new password without leaving the app.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Google sign-in</div>
                  <div className="mt-2 text-sm leading-6 text-slate-200">A provider endpoint is ready for Google Identity Services or OAuth tokens.</div>
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full"
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/90 shadow-[0_30px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <div className="h-1 bg-gradient-to-r from-secondary via-sky-400 to-secondary" />
                <div className={`p-6 sm:p-8 ${view === "register" ? "max-h-[82vh] overflow-y-auto" : ""}`}>
                  <div className="mb-6 flex gap-2 rounded-2xl border border-border/70 bg-muted/40 p-1 text-sm text-slate-700">
                    {(["login", "register", "forgot"] as AuthView[]).map((entry) => (
                      <button
                        key={entry}
                        type="button"
                        onClick={() => setView(entry)}
                        className={`flex-1 rounded-2xl px-4 py-3 font-medium capitalize transition ${view === entry ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {entry === "forgot" ? "Forgot password" : entry}
                      </button>
                    ))}
                  </div>

                  {view === "login" && (
                    <LoginForm
                      onSwitchToRegister={() => setView("register")}
                      onSwitchToForgot={() => setView("forgot")}
                    />
                  )}
                  {view === "register" && <RegisterForm onSwitchToLogin={() => setView("login")} />}
                  {view === "forgot" && <ForgotPasswordForm onSwitchToLogin={() => setView("login")} />}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="pb-3 text-center text-xs text-slate-400">
          © 2026 CampusFlow. JWT-backed auth for dashboard-driven university workflows.
        </p>
      </div>
    </div>
  );
}