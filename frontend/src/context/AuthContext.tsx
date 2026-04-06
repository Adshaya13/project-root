import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, authStorage } from "@/services/auth";
import type {
  AuthSession,
  ForgotPasswordRequest,
  GoogleAuthRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignupRequest,
  VerifySignupRequest,
} from "@/types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession | null) => void;
  login: (payload: LoginRequest) => Promise<AuthSession>;
  requestRegistrationOtp: (payload: SignupRequest) => Promise<void>;
  verifyRegistrationOtp: (payload: VerifySignupRequest) => Promise<AuthSession>;
  requestPasswordResetOtp: (payload: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<AuthSession>;
  googleAuth: (payload: GoogleAuthRequest) => Promise<AuthSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => authStorage.read());

  useEffect(() => {
    authStorage.write(session);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      setSession: setSessionState,
      login: async (payload) => {
        const nextSession = await authApi.login(payload);
        setSessionState(nextSession);
        return nextSession;
      },
      requestRegistrationOtp: async (payload) => {
        await authApi.requestRegistrationOtp(payload);
      },
      verifyRegistrationOtp: async (payload) => {
        const nextSession = await authApi.verifyRegistrationOtp(payload);
        setSessionState(nextSession);
        return nextSession;
      },
      requestPasswordResetOtp: async (payload) => {
        await authApi.requestPasswordResetOtp(payload);
      },
      resetPassword: async (payload) => {
        const nextSession = await authApi.resetPassword(payload);
        setSessionState(nextSession);
        return nextSession;
      },
      googleAuth: async (payload) => {
        const nextSession = await authApi.googleAuth(payload);
        setSessionState(nextSession);
        return nextSession;
      },
      logout: () => {
        authStorage.write(null);
        setSessionState(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}