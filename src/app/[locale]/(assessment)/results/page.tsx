'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { ResultsContextCard } from '@/components/context/ResultsContextCard';
import { ResultsInteractiveCard } from '@/components/interactive/ResultsInteractiveCard';
import ClientOnly from '@/components/ClientOnly';

export default function ResultsPage() {
  return (
    <ClientOnly>
      <PageLayout
        contextCard={<ResultsContextCard />}
        interactiveCard={<ResultsInteractiveCard />}
      />
    </ClientOnly>
  );
} 