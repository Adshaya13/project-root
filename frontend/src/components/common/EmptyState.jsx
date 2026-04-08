import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyState = ({ icon: Icon = FileQuestion, title, description, action, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center" data-testid="empty-state">
      <div className="rounded-full bg-slate-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      {action && onAction && (
        <Button onClick={onAction} data-testid="empty-state-action">
          {action}
        </Button>
      )}
    </div>
  );
};
