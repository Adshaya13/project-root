import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ConfirmDialog = ({ open, onOpenChange, title, description, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'default' }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border border-slate-200 shadow-2xl" data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-300 text-slate-700 hover:bg-slate-100" data-testid="confirm-dialog-cancel">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#1e3a5f] text-white hover:bg-slate-800'}
            data-testid="confirm-dialog-confirm"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
