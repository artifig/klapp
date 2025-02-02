'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { AssessmentContextCard } from '@/components/context/AssessmentContextCard';
import { AssessmentInteractiveCard } from '@/components/interactive/AssessmentInteractiveCard';
import ClientOnly from '@/components/ClientOnly';

export default function AssessmentPage() {
  return (
    <ClientOnly>
      <PageLayout
        contextCard={<AssessmentContextCard />}
        interactiveCard={<AssessmentInteractiveCard />}
      />
    </ClientOnly>
  );
} 