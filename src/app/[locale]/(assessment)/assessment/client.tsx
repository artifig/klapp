'use client';

import { Interactive } from './components/interactive';
import { Context } from './components/context';
import { AirtableMethodAnswer, AirtableMethodCategory, AirtableMethodQuestion } from '@/lib/airtable';

interface AssessmentClientProps {
  initialData: {
    categories: AirtableMethodCategory[];
    questions: AirtableMethodQuestion[];
    answers: AirtableMethodAnswer[];
  };
}

export function AssessmentClient({ initialData }: AssessmentClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Interactive initialData={initialData} />
      <Context />
    </div>
  );
} 