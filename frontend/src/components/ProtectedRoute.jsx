import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { hasRole } from '@/utils/roleHelpers';
import { LoadingSpinner } from '@/components/common/Spinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f111a] transition-colors duration-300">
        <LoadingSpinner message="Verifying access..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user has no role, redirect to role selection
  if (!user?.role) {
    return <Navigate to="/role-selection" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(user?.role, allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
