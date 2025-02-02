import { getMethodCategories, getMethodAnswers, getMethodQuestions } from '@/lib/airtable';
import { AssessmentClient } from './client';

export default async function Page() {
  const [categories, questions, answers] = await Promise.all([
    getMethodCategories(), // Fetch all categories, we'll filter in the client
    getMethodQuestions(),
    getMethodAnswers()
  ]);

  return (
    <AssessmentClient
      initialData={{
        categories,
        questions,
        answers
      }}
    />
  );
} 