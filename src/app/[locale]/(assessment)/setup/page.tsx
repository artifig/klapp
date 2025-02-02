import { useTranslations } from 'next-intl';
import { SetupInteractiveCard } from '@/components/interactive/SetupInteractiveCard';
import { SetupContextCard } from '@/components/context/SetupContextCard';
import { getMethodCompanyTypes } from '@/lib/airtable';

export default async function SetupPage() {
  const t = useTranslations('Setup');
  const companyTypes = await getMethodCompanyTypes();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <SetupInteractiveCard initialCompanyTypes={companyTypes} />
      <SetupContextCard />
    </div>
  );
} 
