import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AssessmentContextCard } from '@/components/context/AssessmentContextCard';
import { AssessmentInteractiveCard } from '@/components/interactive/AssessmentInteractiveCard';
import ClientOnly from '@/components/ClientOnly';
import { fetchAssessmentData } from '@/lib/actions';

export default async function AssessmentPage() {
  const { categories, answers } = await fetchAssessmentData();

  return (
    <ClientOnly>
      <PageLayout
        contextCard={<AssessmentContextCard initialCategories={categories} />}
        interactiveCard={
          <AssessmentInteractiveCard 
            initialCategories={categories} 
            initialAnswers={answers}
          />
        }
      />
    </ClientOnly>
  );
} 