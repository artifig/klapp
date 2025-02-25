'use client';

import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

// Different container sizes based on whether the app is embedded or standalone
const ContainerSizes = {
  standalone: {
    sm: 'max-w-sm mx-auto px-4',
    md: 'max-w-md mx-auto px-4',
    lg: 'max-w-lg mx-auto px-4',
    xl: 'max-w-xl mx-auto px-4',
    '2xl': 'max-w-2xl mx-auto px-4',
    '3xl': 'max-w-3xl mx-auto px-4',
    '4xl': 'max-w-4xl mx-auto px-4',
    '5xl': 'max-w-5xl mx-auto px-4',
    '6xl': 'max-w-6xl mx-auto px-4',
    '7xl': 'max-w-7xl mx-auto px-4',
    full: 'w-full px-4',
  },
  embedded: {
    sm: 'w-full px-2',
    md: 'w-full px-2',
    lg: 'w-full px-2',
    xl: 'w-full px-2',
    '2xl': 'w-full px-2',
    '3xl': 'w-full px-2',
    '4xl': 'w-full px-2',
    '5xl': 'w-full px-2',
    '6xl': 'w-full px-2',
    '7xl': 'w-full px-2',
    full: 'w-full px-2',
  },
};

export type ContainerSize = keyof typeof ContainerSizes.standalone;

type ResponsiveContainerProps = {
  children: React.ReactNode;
  size?: ContainerSize;
  className?: string;
};

export function ResponsiveContainer({
  children,
  size = 'lg',
  className = '',
}: ResponsiveContainerProps) {
  const { isEmbedded } = useTheme();
  
  const containerType = isEmbedded ? 'embedded' : 'standalone';
  const sizeClass = ContainerSizes[containerType][size];
  
  return (
    <div className={`${sizeClass} ${className}`}>
      {children}
    </div>
  );
}

type ResponsiveLayoutProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  containerSize?: ContainerSize;
  className?: string;
};

export function ResponsiveLayout({
  children,
  header,
  footer,
  sidebar,
  containerSize = 'lg',
  className = '',
}: ResponsiveLayoutProps) {
  const { isEmbedded } = useTheme();
  
  // Apply different layouts based on embedded status
  if (isEmbedded) {
    return (
      <div className={`flex flex-col min-h-screen ${className}`}>
        {header && <div className="py-2">{header}</div>}
        <main className="flex-grow">
          <ResponsiveContainer size={containerSize}>
            {children}
          </ResponsiveContainer>
        </main>
        {footer && <div className="py-2">{footer}</div>}
      </div>
    );
  }
  
  // Standalone layout with sidebar if provided
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      {header && <div className="py-4">{header}</div>}
      <div className="flex flex-grow">
        {sidebar && (
          <aside className="hidden md:block w-64 shrink-0 border-r border-border bg-muted">
            {sidebar}
          </aside>
        )}
        <main className="flex-grow">
          <ResponsiveContainer size={containerSize}>
            {children}
          </ResponsiveContainer>
        </main>
      </div>
      {footer && <div className="py-4">{footer}</div>}
    </div>
  );
} 