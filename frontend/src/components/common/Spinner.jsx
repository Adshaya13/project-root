import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${className}`} data-testid="spinner" />
  );
};

export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12" data-testid="loading-spinner">
      <Spinner size="lg" className="text-[#1e3a5f]" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
};
