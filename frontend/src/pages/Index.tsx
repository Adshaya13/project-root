import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/dashboard-paths";
import universityBg from "@/assets/university-bg.jpg";

type AuthView = "login" | "register" | "forgot";

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryView = searchParams.get("view");
  const [view, setView] = useState<AuthView>(queryView === "register" || queryView === "forgot" ? queryView : "login");
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const nextView: AuthView = queryView === "register" || queryView === "forgot" ? queryView : "login";
    setView(nextView);
  }, [queryView]);

  const changeView = (nextView: AuthView) => {
    setView(nextView);
    setSearchParams({ view: nextView }, { replace: true });
  };

  useEffect(() => {
    if (session) {
      navigate(getDashboardPath(session.user.role), { replace: true });
    }
  }, [navigate, session]);

  return (
    <div className="relative h-dvh overflow-hidden font-body">
      <img
        src={universityBg}
        alt="University campus"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto grid h-full w-full max-w-6xl grid-cols-1 items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:px-8 lg:py-6">
        <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-6 text-primary-foreground shadow-2xl backdrop-blur-md lg:block lg:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary shadow-lg">
              <GraduationCap className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">UniPortal</h2>
              <p className="text-[11px] text-primary-foreground/70">University Management System</p>
            </div>
          </div>

          <h1 className="font-display max-w-xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Learn smarter, manage faster, and stay connected.
          </h1>
          <p className="mt-4 max-w-lg text-sm text-primary-foreground/85 sm:text-base">
            Access courses, campus announcements, and your personalized dashboard in one secure place.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-black/10 p-4">
              <div className="font-display text-2xl font-bold">24/7</div>
              <div className="text-xs text-primary-foreground/70">Portal availability</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-black/10 p-4">
              <div className="font-display text-2xl font-bold">3 roles</div>
              <div className="text-xs text-primary-foreground/70">Student, staff, admin</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-black/10 p-4">
              <div className="font-display text-2xl font-bold">Secure</div>
              <div className="text-xs text-primary-foreground/70">OTP and JWT sessions</div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full self-center lg:justify-self-end"
          >
            <div className="max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl lg:max-h-[calc(100dvh-3rem)]">
              <div className="h-1 bg-gradient-to-r from-secondary via-secondary/80 to-secondary" />
              <div className="max-h-[calc(100dvh-2.25rem)] overflow-y-auto p-5 sm:max-h-[calc(100dvh-3.25rem)] sm:p-6 lg:max-h-[calc(100dvh-4rem)]">
                {view === "login" && (
                  <LoginForm
                    onSwitchToRegister={() => changeView("register")}
                    onSwitchToForgot={() => changeView("forgot")}
                  />
                )}
                {view === "register" && <RegisterForm onSwitchToLogin={() => changeView("login")} />}
                {view === "forgot" && <ForgotPasswordForm onSwitchToLogin={() => changeView("login")} />}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="absolute bottom-3 z-10 hidden w-full text-center text-xs text-primary-foreground/40 lg:block">
        © 2026 UniPortal. All rights reserved.
      </p>
    </div>
  );
}