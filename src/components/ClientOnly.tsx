'use client';

import { useEffect, useState } from 'react';
import { Loading } from './ui/Loading';

interface ClientOnlyProps {
  children: React.ReactNode;
  type?: 'card' | 'full';
}

export default function ClientOnly({ children, type = 'card' }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <Loading type={type} />;
  }

  return <>{children}</>;
} 