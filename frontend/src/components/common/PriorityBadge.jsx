import React from 'react';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
};

export const PriorityBadge = ({ priority, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border',
        PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
      data-testid={`priority-badge-${priority?.toLowerCase()}`}
    >
      {priority}
    </span>
  );
};
