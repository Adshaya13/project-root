import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleIcon from "@/components/auth/GoogleIcon";
import type { Role } from "@/types/auth";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSwitchToForgot }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const suggestedRole = useMemo<Role>(() => {
    const lower = email.toLowerCase();
    if (lower.includes("admin")) {
      return "admin";
    }
    if (lower.includes("staff")) {
      return "staff";
    }
    return "student";
  }, [email]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const session = await login({ email, password });
      toast.success(`Welcome back, ${session.user.fullName}`);
      navigate(`/dashboard/${session.user.role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const googleEmail = email || window.prompt("Enter your Google email")?.trim();
    if (!googleEmail) {
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await googleAuth({
        email: googleEmail,
        fullName: googleEmail.split("@")[0].replace(/[._-]/g, " "),
        role: suggestedRole,
        googleSubject: `google-${googleEmail.toLowerCase()}`,
      });
      toast.success(`Google sign-in connected for ${session.user.fullName}`);
      navigate(`/dashboard/${session.user.role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="font-display mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="font-body text-sm text-muted-foreground">Sign in to your university portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="font-body text-sm font-medium text-foreground">Email Address</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@university.edu"
              className="h-12 w-full rounded-md border-border bg-muted/50 pl-10 pr-4 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="font-body text-sm font-medium text-foreground">Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 w-full rounded-md border-border bg-muted/50 pl-10 pr-12 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="font-body text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Sign In
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 font-body text-muted-foreground">or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background px-5 font-body text-sm font-medium text-foreground transition-all duration-300 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="font-body mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Create account
          </button>
        </p>
      </form>
    </div>
  );
}