import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SetupContextCard } from '@/components/context/SetupContextCard';
import { SetupInteractiveCard } from '@/components/interactive/SetupInteractiveCard';
import ClientOnly from '@/components/ClientOnly';
import { fetchCompanyTypes } from '@/lib/actions';

export default async function SetupPage() {
  const { companyTypes } = await fetchCompanyTypes();

  return (
    <ClientOnly>
      <PageLayout
        contextCard={<SetupContextCard />}
        interactiveCard={<SetupInteractiveCard initialCompanyTypes={companyTypes} />}
      />
    </ClientOnly>
  );
} 
