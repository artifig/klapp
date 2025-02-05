import { ResultsClient } from './client';
import { getCategories, getAnswers, getSolutionLevels } from '@/lib/airtable/queries';
import { redirect } from '@/i18n/navigation';

export default async function ResultsPage() {
  try {
    const [categories, answers, solutionLevels] = await Promise.all([
      getCategories(),
      getAnswers(),
      getSolutionLevels()
    ]);

    console.log('🔍 Raw categories data:', categories);

    return <ResultsClient initialData={{ categories, answers, solutionLevels }} />;
  } catch (error) {
    console.error('Error in ResultsPage:', error);
    redirect('/assessment');
  }
} 