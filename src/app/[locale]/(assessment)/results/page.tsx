import { getCategories, getQuestions, getAnswers } from '@/lib/airtable/queries';
import { ResultsClient } from './client';
import { redirect } from '@/i18n/navigation';

export default async function ResultsPage() {
  try {
    const [categories, questions, answers] = await Promise.all([
      getCategories(),
      getQuestions(),
      getAnswers()
    ]);

    return <ResultsClient initialData={{ categories, questions, answers }} />;
  } catch (error) {
    console.error('Error in ResultsPage:', error);
    redirect('/assessment');
  }
} 