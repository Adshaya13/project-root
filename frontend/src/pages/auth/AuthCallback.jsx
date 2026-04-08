import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { getRoleDashboard } from '@/utils/roleHelpers';
import { LoadingSpinner } from '@/components/common/Spinner';
import { toast } from 'sonner';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

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
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <LoadingSpinner message="Completing sign in..." />
    </div>
  );
};
