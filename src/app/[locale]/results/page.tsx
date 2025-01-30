import { PageLayout } from '@/components/layout/PageLayout';
import { ResultsContextCard } from '@/components/context/ResultsContextCard';
import { ResultsInteractiveCard } from '@/components/interactive/ResultsInteractiveCard';

export default function ResultsPage() {
  return (
    <PageLayout
      contextCard={<ResultsContextCard />}
      interactiveCard={<ResultsInteractiveCard />}
    />
  );
} 