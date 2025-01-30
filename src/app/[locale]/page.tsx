import { PageLayout } from '@/components/layout/PageLayout';
import { HomeContextCard } from '@/components/context/HomeContextCard';
import { HomeInteractiveCard } from '@/components/interactive/HomeInteractiveCard';

export default function HomePage() {
  return (
    <PageLayout
      contextCard={<HomeContextCard />}
      interactiveCard={<HomeInteractiveCard />}
    />
  );
} 
