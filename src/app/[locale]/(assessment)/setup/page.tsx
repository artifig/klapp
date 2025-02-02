import { type NextPage } from 'next';
import { type PageProps } from '../../page';
import { getMethodCompanyTypes } from '@/lib/airtable';
import { SetupClient } from './client';

const SetupPage: NextPage<PageProps> = async () => {
  const companyTypes = await getMethodCompanyTypes();

  return <SetupClient initialCompanyTypes={companyTypes} />;
};

export default SetupPage; 
