import { getCategories, getQuestions, getAnswers } from '@/lib/airtable/queries';
import Client from './client';
import { redirect } from '@/i18n/navigation';

export default async function AssessmentPage() {
  try {
    // Get the selected company type from localStorage in client component
    const [categories, questions, answers] = await Promise.all([
      getCategories(), // We'll filter categories in the client component
      getQuestions(),
      getAnswers()
    ]);

    return <Client initialData={{ categories, questions, answers }} />;
  } catch (error) {
    console.error('Error in AssessmentPage:', error);
    redirect('/home');
  }
} 