import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
// import { authService } from '@/services/authService';
// import { getRoleDashboard } from '@/utils/roleHelpers';
import { LoadingSpinner } from '@/components/common/Spinner';
import { toast } from 'sonner';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    // ---- GOOGLE OAUTH COMMENTED OUT TEMPORARILY ----
    /*
    const processAuth = async () => {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Invalid authentication response');
          navigate('/login');
          return;
        }

        await authService.createSession(sessionId);
        const userData = await authService.getMe();
        
        login(userData);
        
        // Check if user has selected a role
        if (!userData.role) {
          // No role selected yet, redirect to role selection
          toast.info('Please select your role to continue');
          navigate('/role-selection');
          return;
        }
        
        // User has a role, redirect to appropriate dashboard
        toast.success(`Welcome back, ${userData.name}!`);
        navigate(getRoleDashboard(userData.role));
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    processAuth();
    */

    // DUMMY: Immediately fail or redirect since we don't use this anymore
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen relative bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1e3a5f] rounded-full blur-[150px] opacity-40 animate-pulse" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col items-center gap-6">
          <LoadingSpinner message="" />
          <p className="text-xl font-medium text-white tracking-wide animate-pulse" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Completing sign in...
          </p>
        </div>
      </div>
    </div>
  );
};
