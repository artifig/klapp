import { getCategories, getQuestions, getAnswers } from '@/lib/airtable/queries';
import { Client } from './client';

export default async function AssessmentPage() {
  const [categories, questions, answers] = await Promise.all([
    getCategories(),
    getQuestions(),
    getAnswers()
  ]);

  return <Client initialData={{ categories, questions, answers }} />;
} 