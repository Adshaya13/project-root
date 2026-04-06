import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Phone, ShieldCheck, User, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { isValidSriLankaPhone, isValidEmail, isValidPassword } from "@/lib/validations";
import type { SignupRequest } from "@/types/auth";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    role: "student",
    password: "",
    confirmPassword: "",
  });
  const { requestRegistrationOtp, verifyRegistrationOtp, googleAuth } = useAuth();
  const navigate = useNavigate();

  const registrationPayload = useMemo<SignupRequest>(
    () => ({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      gender: form.gender,
      role: form.role === "staff" ? "staff" : "student",
      password: form.password,
    }),
    [form],
  );

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    // Clear validation error for this field
    setValidationErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!isValidSriLankaPhone(form.phone)) {
      errors.phone = "Please enter a valid Sri Lanka phone number (e.g., +94701234567 or 0701234567)";
    }

    if (!form.gender) {
      errors.gender = "Gender is required";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (!isValidPassword(form.password)) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRequestOtp = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setIsSubmitting(true);
      await requestRegistrationOtp(registrationPayload);
      setStep("otp");
      toast.success("Six-digit verification code sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const session = await verifyRegistrationOtp({ email: form.email, otp });
      toast.success(`Account verified for ${session.user.fullName}`);
      navigate(`/dashboard/${session.user.role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    const email = form.email || window.prompt("Enter your Google email")?.trim();
    if (!email) {
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await googleAuth({
        email,
        fullName: form.fullName || email.split("@")[0].replace(/[._-]/g, " "),
        role: form.role === "staff" ? "staff" : "student",
        googleSubject: `google-${email.toLowerCase()}`,
      });
      toast.success(`Google account linked for ${session.user.fullName}`);
      navigate(`/dashboard/${session.user.role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="font-display mb-2 text-3xl font-bold text-foreground">Create Account</h1>
        <p className="font-body text-sm text-muted-foreground">Join our university community today</p>
      </div>

      <form onSubmit={step === "details" ? handleRequestOtp : handleVerifyOtp} className="space-y-4">
        {step === "details" ? (
          <>
            <label className="block space-y-2">
              <span className="font-body text-sm font-medium text-foreground">Full Name</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={form.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                  placeholder="John Doe"
                  className="h-11 w-full rounded-md border-border bg-muted/50 pl-10 pr-4 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="font-body text-sm font-medium text-foreground">Email Address</span>
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="student@university.edu"
                    className={`h-11 w-full rounded-md border-border bg-muted/50 pl-10 pr-4 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary ${
                      validationErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                </div>
                {validationErrors.email && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.email}
                  </div>
                )}
              </div>
            </label>

            <label className="block space-y-2">
              <span className="font-body text-sm font-medium text-foreground">Phone Number</span>
              <div className="space-y-1">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    placeholder="+94701234567 or 0701234567"
                    className={`h-11 w-full rounded-md border-border bg-muted/50 pl-10 pr-4 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary ${
                      validationErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                </div>
                {validationErrors.phone && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.phone}
                  </div>
                )}
              </div>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="font-body text-sm font-medium text-foreground">Gender</span>
                <select
                  value={form.gender}
                  onChange={(event) => update("gender", event.target.value)}
                  className="h-11 w-full rounded-md border-border bg-muted/50 px-4 font-body text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="font-body text-sm font-medium text-foreground">Role</span>
                <select
                  value={form.role}
                  onChange={(event) => update("role", event.target.value)}
                  className="h-11 w-full rounded-md border-border bg-muted/50 px-4 font-body text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="font-body text-sm font-medium text-foreground">Create Password</span>
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => update("password", event.target.value)}
                    placeholder="Min 8 characters"
                    className={`h-11 w-full rounded-md border-border bg-muted/50 pl-10 pr-12 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary ${
                      validationErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    minLength={8}
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
                {validationErrors.password && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.password}
                  </div>
                )}
              </div>
            </label>

            <label className="block space-y-2">
              <span className="font-body text-sm font-medium text-foreground">Confirm Password</span>
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(event) => update("confirmPassword", event.target.value)}
                    placeholder="Re-enter password"
                    className={`h-11 w-full rounded-md border-border bg-muted/50 pl-10 pr-12 font-body text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary ${
                      validationErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.confirmPassword}
                  </div>
                )}
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Send Verification Code
            </button>
          </>
        ) : (
          <>
            <div className="rounded-md border border-border bg-muted/40 p-4 font-body text-sm text-muted-foreground">
              <div className="font-medium text-foreground">We sent a 6-digit code to {form.email}</div>
              <div className="mt-1">Enter it to activate your account. The code expires in 10 minutes.</div>
            </div>

            <label className="block space-y-2">
              <span className="font-body text-sm font-medium text-foreground">Email OTP</span>
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

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify and Continue
            </button>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-background px-5 font-body text-sm font-medium text-foreground transition-all duration-300 hover:bg-muted/50"
            >
              Back to details
            </button>
          </>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 font-body text-muted-foreground">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-background px-5 font-body text-sm font-medium text-foreground transition-all duration-300 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="font-body mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}