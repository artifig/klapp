'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, routes } from '@/navigation';
import { useLocale } from 'next-intl';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 