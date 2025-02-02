import { type NextPage } from 'next';
import { type PageProps } from '../../page';
import { getMethodCategories, getMethodAnswers, getMethodQuestions } from '@/lib/airtable';
import { AssessmentClient } from './client';

const AssessmentPage: NextPage<PageProps> = async () => {
  const [categories, questions, answers] = await Promise.all([
    getMethodCategories(),
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
};

export default AssessmentPage; 