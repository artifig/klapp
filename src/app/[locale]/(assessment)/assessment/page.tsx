import { useTranslations, useLocale } from 'next-intl';
import AssessmentInteractiveCard from '@/components/interactive/AssessmentInteractiveCard';
import AssessmentContextCard from '@/components/context/AssessmentContextCard';
import { getMethodCategories, getMethodAnswers, getMethodQuestions } from '@/lib/airtable';
import type { Category, Question } from '@/state/AssessmentState';

function transformToCategories(
  airtableCategories: Awaited<ReturnType<typeof getMethodCategories>>,
  airtableQuestions: Awaited<ReturnType<typeof getMethodQuestions>>,
  locale: string
): Category[] {
  return airtableCategories.map((cat, index) => ({
    id: cat.id,
    key: cat.categoryId,
    name: locale === 'et' ? cat.categoryText_et : cat.categoryText_en,
    description: locale === 'et' ? cat.categoryDescription_et : cat.categoryDescription_en,
    order: index,
    companyType: cat.companyType,
    questions: cat.MethodQuestions.map((questionId, qIndex) => {
      const question = airtableQuestions.find(q => q.id === questionId);
      if (!question) return null;
      return {
        id: question.id,
        airtableId: question.id,
        text: locale === 'et' ? question.questionText_et : question.questionText_en,
        categoryId: question.MethodCategories,
        answerId: question.MethodAnswers,
        order: qIndex
      };
    }).filter((q): q is Question => q !== null)
  }));
}

export default async function AssessmentPage() {
  const t = useTranslations('Assessment');
  const locale = useLocale();
  
  // Fetch initial data
  const [airtableCategories, airtableQuestions, answers] = await Promise.all([
    getMethodCategories(),
    getMethodQuestions(),
    getMethodAnswers()
  ]);

  const categories = transformToCategories(airtableCategories, airtableQuestions, locale);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <AssessmentInteractiveCard 
        initialCategories={categories}
        initialAnswers={answers}
      />
      <AssessmentContextCard />
    </div>
  );
} 