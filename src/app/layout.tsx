import { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Readiness Assessment',
  description: 'Assess your company\'s AI readiness level',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
