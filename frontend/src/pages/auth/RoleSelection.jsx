import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { AuthContext } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Wrench, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getRoleDashboard } from '@/utils/roleHelpers';

const ROLES = [
  {
    id: 'USER',
    title: 'User',
    icon: GraduationCap,
    description: 'Browse resources, make bookings, and report incidents',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    id: 'TECHNICIAN',
    title: 'Technician',
    icon: Wrench,
    description: 'Handle assigned maintenance tickets',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    borderColor: 'border-green-200',
  },
];

export const RoleSelection = () => {
  const { user, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login', { replace: true });
      return;
    }

    if (user?.role && !user?.needsRoleSelection) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [navigate, user]);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setSubmitting(true);
    try {
      const updatedUser = await authService.selectRole(selectedRole);
      await checkAuth();
      toast.success(`Welcome! You're now signed in as ${selectedRole}`);
      
      // Redirect to appropriate dashboard
      window.location.href = getRoleDashboard(updatedUser.role || selectedRole);
    } catch (error) {
      toast.error(error.message || 'Failed to set role. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/login-bg.png')`,
        }}
      >
        <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/20 via-transparent to-[#f97316]/10" />
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-white/10 border border-white/20 text-orange-400 rounded-full text-sm font-medium mb-4 backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            Setup Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Choose Your Role
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Select your primary role to customize your dashboard experience and access level
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={`relative group cursor-pointer transition-all duration-500 overflow-hidden ${
                  isSelected
                    ? 'scale-[1.02] border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)] bg-slate-800/80 backdrop-blur-xl'
                    : 'border-white/5 hover:border-white/20 bg-slate-900/50 backdrop-blur-md hover:bg-slate-800/50'
                }`}
                onClick={() => setSelectedRole(role.id)}
                data-testid={`role-card-${role.id.toLowerCase()}`}
              >
                {/* Selection highlight gradient */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none" />
                )}

                <CardContent className="p-6 md:p-8 relative z-10">
                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl ${
                      isSelected ? role.color : 'bg-slate-800 text-slate-300 group-hover:text-white group-hover:bg-slate-700'
                    } transition-colors duration-300 shadow-lg flex-shrink-0`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 transition-colors ${
                        isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}>
                        {role.title}
                      </h3>
                      <p className={`text-sm transition-colors ${
                        isSelected ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'
                      }`}>
                        {role.description}
                      </p>
                    </div>
                    
                    {/* Checkmark icon for selected state */}
                    <div className={`absolute top-6 right-6 transition-all duration-300 ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}>
                      <div className="bg-orange-500 text-white rounded-full p-1.5 shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || submitting}
            className={`px-12 py-7 text-lg font-semibold rounded-xl group relative overflow-hidden transition-all duration-300 ${
              !selectedRole 
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50' 
                : 'bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:-translate-y-1'
            }`}
            data-testid="confirm-role-btn"
          >
            {selectedRole && (
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up account...
                </>
              ) : (
                'Continue to Dashboard'
              )}
            </span>
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Choose your role once to complete onboarding.
        </p>
      </div>
    </div>
  );
};
