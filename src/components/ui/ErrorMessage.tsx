import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div 
      className={cn(
        'flex items-center gap-2 p-3 rounded-md',
        'bg-red-500/10 border border-red-500/20',
        'text-red-500 text-sm animate-fade-in',
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
} 