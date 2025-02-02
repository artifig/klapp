'use client';

import { Interactive } from './components/interactive';
import { Context } from './components/context';
import { AirtableMethodCompanyType } from '@/lib/airtable';

interface SetupClientProps {
  initialCompanyTypes: AirtableMethodCompanyType[];
}

export function SetupClient({ initialCompanyTypes }: SetupClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Interactive initialCompanyTypes={initialCompanyTypes} />
      <Context />
    </div>
  );
} 