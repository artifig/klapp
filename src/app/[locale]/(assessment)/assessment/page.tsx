import { getAirtableData } from '@/lib/airtable';
import { Client } from './client';

export default async function Page() {
  const initialData = await getAirtableData();

  return <Client initialData={initialData} />;
} 