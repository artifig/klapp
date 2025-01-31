'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';

interface CategoryResultProps {
  category: string;
  score: number;
}

interface CategoryScore {
  category: string;
  score: number;
}

const CategoryResult = ({ category, score }: CategoryResultProps) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <span className="text-gray-700">{category}</span>
    <div className="flex items-center space-x-4">
      <div className="w-32 bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-900 w-12 text-right">
        {Math.round(score)}%
      </span>
    </div>
  </div>
);

export const ResultsContextCard = () => {
  const t = useTranslations('results');
  const { 
    categories,
    completedCategories,
    answers
  } = useAssessmentContext();

  const totalQuestions = categories.reduce(
    (acc, category) => acc + category.questions.length,
    0
  );

  const answeredQuestions = Object.keys(answers).length;
  const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <ClientOnly>
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              {t('completion.title')}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex-grow bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {completionPercentage}%
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              {t('categories.title')}
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`px-4 py-2 rounded-md ${
                    completedCategories.includes(category.id)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    {completedCategories.includes(category.id) && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </ClientOnly>
  );
};

export default ResultsContextCard; 