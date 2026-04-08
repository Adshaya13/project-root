import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Wrench, BarChart3, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getRoleDashboard } from '@/utils/roleHelpers';

const ROLES = [
  {
    id: 'USER',
    title: 'Student / Staff',
    icon: GraduationCap,
    description: 'Browse resources, make bookings, report incidents',
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
  {
    id: 'MANAGER',
    title: 'Manager',
    icon: BarChart3,
    description: 'Oversee bookings and resources',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    borderColor: 'border-orange-200',
  },
  {
    id: 'ADMIN',
    title: 'Admin',
    icon: Shield,
    description: 'Full system control and management',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    borderColor: 'border-purple-200',
  },
];

export const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setSubmitting(true);
    try {
      await authService.selectRole(selectedRole);
      toast.success(`Welcome! You're now signed in as ${selectedRole}`);
      
      // Redirect to appropriate dashboard
      window.location.href = getRoleDashboard(selectedRole);
    } catch (error) {
      toast.error('Failed to set role. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-[#1e3a5f] text-white rounded-full text-sm font-medium mb-4">
            Welcome to Campus Hub
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Choose Your Role
          </h1>
          <p className="text-lg text-slate-600" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Select your role to access the appropriate dashboard and features
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-offset-2 shadow-xl scale-105'
                    : 'hover:shadow-lg hover:scale-102 border-slate-200'
                } bg-white`}
                style={isSelected ? { ringColor: role.color.replace('bg-', '') } : {}}
                onClick={() => setSelectedRole(role.id)}
                data-testid={`role-card-${role.id.toLowerCase()}`}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl ${role.color} text-white flex-shrink-0`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h3>
                      <p className="text-slate-600 text-sm">{role.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className={`${role.color} text-white rounded-full p-1`}>
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    )}
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
            className={`px-12 py-6 text-lg font-semibold ${!selectedRole ? 'bg-slate-300' : 'bg-[#f97316] hover:bg-orange-600'} transition-all duration-200`}
            data-testid="confirm-role-btn"
          >
            {submitting ? 'Setting up your account...' : 'Continue to Dashboard'}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-slate-500 mt-8">
          You can contact an administrator if you need to change your role later
        </p>
      </div>
    </div>
  );
};
