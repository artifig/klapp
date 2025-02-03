import { getCompanyTypes } from '@/lib/airtable/queries';
import { Client } from './client';

export default async function SetupPage() {
  const companyTypes = await getCompanyTypes();
  return <Client initialCompanyTypes={companyTypes} />;
} 
