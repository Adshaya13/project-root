import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
  OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800 border-red-200',
};

export const StatusPill = ({ status, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200',
        className
      )}
      data-testid={`status-pill-${status?.toLowerCase()}`}
    >
      {status}
    </span>
  );
};
