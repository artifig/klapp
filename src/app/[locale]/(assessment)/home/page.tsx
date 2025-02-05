import { HomeClient } from './client';
import { getCompanyTypes } from '@/lib/airtable/queries';

export default async function HomePage() {
  const companyTypes = await getCompanyTypes();
  return <HomeClient initialCompanyTypes={companyTypes} />;
} 
