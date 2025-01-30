import { PageLayout } from '@/components/layout/PageLayout';
import { AssessmentContextCard } from '@/components/context/AssessmentContextCard';
import { AssessmentInteractiveCard } from '@/components/interactive/AssessmentInteractiveCard';

export default function AssessmentPage() {
  return (
    <PageLayout
      contextCard={<AssessmentContextCard />}
      interactiveCard={<AssessmentInteractiveCard />}
    />
  );
} 