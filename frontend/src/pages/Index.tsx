import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useAuth } from "@/context/AuthContext";
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
      navigate(`/dashboard/${session.user.role}`, { replace: true });
    }
  }, [navigate, session]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden font-body">
      <img
        src={universityBg}
        alt="University campus"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />

      <div className="absolute left-6 top-6 z-20 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary shadow-lg">
          <GraduationCap className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-primary-foreground">UniPortal</h2>
          <p className="text-[11px] text-primary-foreground/60">University Management System</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-4 w-full max-w-md"
        >
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-secondary via-secondary/80 to-secondary" />
            <div className={`p-8 sm:p-10 ${view === "register" ? "max-h-[78vh] overflow-y-auto" : ""}`}>
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

      <p className="absolute bottom-4 z-10 w-full text-center text-xs text-primary-foreground/40">
        © 2026 UniPortal. All rights reserved.
      </p>
    </div>
  );
}