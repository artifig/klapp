import { WifiOff, CloudOff, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SyncStatus as SyncStatusType } from '@/lib/sync';

interface SyncStatusProps {
  isOffline: boolean;
  status: SyncStatusType;
  className?: string;
  variant?: 'default' | 'compact';
}

export function SyncStatus({ 
  isOffline, 
  status, 
  className,
  variant = 'default'
}: SyncStatusProps) {
  if (!isOffline && status === 'synced' && variant === 'default') return null;

  const Icon = isOffline 
    ? WifiOff 
    : status === 'pending' 
      ? Cloud 
      : status === 'error' 
        ? CloudOff 
        : Cloud;

  const iconColor = isOffline 
    ? 'text-yellow-500' 
    : status === 'pending' 
      ? 'text-blue-500' 
      : status === 'error' 
        ? 'text-red-500' 
        : 'text-green-500';

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          'flex items-center gap-2 px-2',
          className
        )}
        role="status"
      >
        <Icon 
          className={cn(
            'w-4 h-4',
            iconColor,
            status === 'pending' && 'animate-spin'
          )}
        />
        <span className="sr-only">
          {isOffline
            ? 'Offline mode'
            : status === 'pending'
              ? 'Syncing'
              : status === 'error'
                ? 'Sync failed'
                : 'Synced'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg animate-fade-in',
        {
          'bg-yellow-500/10 border border-yellow-500/20': isOffline,
          'bg-blue-500/10 border border-blue-500/20': !isOffline && status === 'pending',
          'bg-red-500/10 border border-red-500/20': !isOffline && status === 'error'
        },
        className
      )}
      role="status"
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', iconColor, status === 'pending' && 'animate-spin')} />
        <span
          className={cn({
            'text-yellow-500': isOffline,
            'text-blue-500': !isOffline && status === 'pending',
            'text-red-500': !isOffline && status === 'error'
          })}
        >
          {isOffline
            ? 'You are offline. Your changes will be saved locally.'
            : status === 'pending'
              ? 'Syncing your changes...'
              : 'Failed to sync. Retrying...'}
        </span>
      </div>
    </div>
  );
} 