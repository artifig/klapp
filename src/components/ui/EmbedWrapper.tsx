'use client';

import { useEmbed } from '@/context/EmbedContext';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface EmbedWrapperProps {
  children: ReactNode;
  className?: string;
}

export function EmbedWrapper({ children, className }: EmbedWrapperProps) {
  const { isEmbedded } = useEmbed();

  return (
    <div
      className={cn(
        'w-full transition-all duration-200',
        isEmbedded && 'embedded-mode max-h-[inherit] overflow-y-auto',
        className
      )}
      style={isEmbedded ? {
        margin: 0,
        padding: 0,
      } : undefined}
    >
      {children}
    </div>
  );
} 
