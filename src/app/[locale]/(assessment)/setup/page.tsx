'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { SetupContextCard } from '@/components/context/SetupContextCard';
import { SetupInteractiveCard } from '@/components/interactive/SetupInteractiveCard';
import ClientOnly from '@/components/ClientOnly';

export default function SetupPage() {
  return (
    <ClientOnly>
      <PageLayout
        contextCard={<SetupContextCard />}
        interactiveCard={<SetupInteractiveCard />}
      />
    </ClientOnly>
  );
} 
