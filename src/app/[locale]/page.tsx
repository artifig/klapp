'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { HomeContextCard } from '@/components/context/HomeContextCard';
import { HomeInteractiveCard } from '@/components/interactive/HomeInteractiveCard';
import ClientOnly from '@/components/ClientOnly';

export default function HomePage() {
  return (
    <ClientOnly>
      <PageLayout
        contextCard={<HomeContextCard />}
        interactiveCard={<HomeInteractiveCard />}
      />
    </ClientOnly>
  );
} 
