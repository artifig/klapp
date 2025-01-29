'use client';

import {ReactNode} from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({children}: PageWrapperProps) {
  return (
    <div className="h-[calc(100vh-16rem)]">
      {children}
    </div>
  );
} 