import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { getRoleDashboard } from '@/utils/roleHelpers';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BorderBeam } from "@/registry/magicui/border-beam"

export const Login = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboard(user.role));
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = () => {
    // DUMMY LOGIN FLOW
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/40 via-transparent to-[#f97316]/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left side text */}
        <div className="flex-1 text-center lg:text-left text-white px-4 lg:px-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6 text-orange-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            System Live
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Smart Campus<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Operations Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 md:max-w-2xl mx-auto lg:mx-0 leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
            The next generation of campus management. Streamline resource management, secure bookings, and handle maintenance tickets in one powerful, unified platform.
          </p>
        </div>

        {/* Right side login card replacing the old custom element with shadcn Card + BorderBeam */}
        <div className="w-full max-w-md lg:w-[450px]">
          <Card className="relative w-full overflow-hidden bg-[#0f172a]/80 backdrop-blur-xl border-white/10 text-white shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold font-['Cabinet_Grotesk'] text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400 font-['Manrope']">Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6">
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base"
                  data-testid="google-login-button"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="text-center text-xs text-slate-400">
                  By signing in, you agree to our <span className="text-white hover:underline cursor-pointer">Terms</span> and <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full mt-2 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Authorized university personnel only
                </p>
              </div>
            </CardFooter>

            <BorderBeam
              duration={6}
              size={400}
              className="from-transparent via-orange-500 to-transparent"
            />
            <BorderBeam
              duration={6}
              delay={3}
              size={400}
              borderWidth={2}
              className="from-transparent via-blue-500 to-transparent"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
