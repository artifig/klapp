'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Theme } from '@/lib/theme';

// Add more providers as needed (e.g. AuthProvider, NotificationProvider, etc.)

interface ProvidersProps {
  children: React.ReactNode;
  initialTheme?: Partial<Theme>;
}

/**
 * Providers component that wraps the application with all necessary context providers.
 * This provides a clean way to organize all providers in one place.
 */
export function Providers({ children, initialTheme }: ProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      {/* Add additional providers here */}
      {children}
    </ThemeProvider>
  );
} 