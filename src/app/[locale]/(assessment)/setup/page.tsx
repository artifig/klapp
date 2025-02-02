import { getMethodCompanyTypes } from '@/lib/airtable';
import { SetupClient } from './client';

export default async function SetupPage() {
  const companyTypes = await getMethodCompanyTypes();

  return <SetupClient initialCompanyTypes={companyTypes} />;
} 
