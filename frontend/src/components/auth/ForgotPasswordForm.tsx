import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestPasswordResetOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      await requestPasswordResetOtp({ email });
      setStep("otp");
      toast.success("Reset code sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await resetPassword({ email, otp, newPassword });
      toast.success(`Password updated for ${session.user.fullName}`);
      navigate(`/dashboard/${session.user.role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onSwitchToLogin}
        className="font-body mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>

      <div className="mb-8 text-center">
        <h1 className="font-display mb-2 text-3xl font-bold text-foreground">Reset Password</h1>
        <p className="font-body text-sm text-muted-foreground">Request a six-digit code and set a new secure password</p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleRequestOtp} className="space-y-5">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="rounded-md border border-border bg-muted/40 p-4 font-body text-sm text-muted-foreground">
            <div className="font-medium text-foreground">We sent a 6-digit code to {email}</div>
            <div className="mt-1">Enter it, then create a new password.</div>
          </div>

          <label className="block space-y-2">
            <span className="font-body text-sm font-medium text-foreground">OTP Code</span>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              className="h-12 w-full rounded-md border-border bg-muted/50 px-4 text-center tracking-[0.4em] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="font-body text-sm font-medium text-foreground">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Create a new password"
              className="h-12 w-full rounded-md border-border bg-muted/50 px-4 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              minLength={8}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="font-body text-sm font-medium text-foreground">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the new password"
              className="h-12 w-full rounded-md border-border bg-muted/50 px-4 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              minLength={8}
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Update Password
          </button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-background px-5 font-body text-sm font-medium text-foreground transition-all duration-300 hover:bg-muted/50"
          >
            Use another email
          </button>
        </form>
      )}
    </div>
  );
}