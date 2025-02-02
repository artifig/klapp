import { getMethodCategories, getMethodAnswers, getMethodQuestions } from '@/lib/airtable';
import { AssessmentClient } from './client';

export default async function AssessmentPage() {
  const [categories, questions, answers] = await Promise.all([
    getMethodCategories(),
    getMethodQuestions(),
    getMethodAnswers()
  ]);

  return <AssessmentClient initialData={{ categories, questions, answers }} />;
} 