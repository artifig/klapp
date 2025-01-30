import { PageLayout } from '@/components/layout/PageLayout';
import { SetupContextCard } from '@/components/context/SetupContextCard';
import { SetupInteractiveCard } from '@/components/interactive/SetupInteractiveCard';

export default function SetupPage() {
  return (
    <PageLayout
      contextCard={<SetupContextCard />}
      interactiveCard={<SetupInteractiveCard />}
    />
  );
} 
