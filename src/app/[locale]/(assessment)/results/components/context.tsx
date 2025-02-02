'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAssessmentState } from '@/state/AssessmentState';
import ClientOnly from '@/components/ClientOnly';

interface CategoryResult {
  category: string;
  score: number;
}

const CategoryResult = ({ category, score }: CategoryResult) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-700">{category}</span>
    <span className="text-primary font-medium">{score}%</span>
  </div>
);

export const Context = () => {
  const t = useTranslations('results');
  const { 
    categories,
    completedCategories = [],
    answers
  } = useAssessmentState();

  const totalQuestions = categories.reduce(
    (acc, category) => acc + category.questions.length,
    0
  );

  const answeredQuestions = Object.keys(answers).length;
  const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('contextCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                {t('contextCard.overallScore')}
              </h3>
              <div className="text-4xl font-bold text-primary">
                {Math.round(completionPercentage)}%
              </div>
            </div>

            {/* Category Scores */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                {t('contextCard.categoryScores')}
              </h3>
              <div>
                {categories.map((category) => (
                  <CategoryResult
                    key={category.id}
                    category={category.name}
                    score={completionPercentage}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
};

export default Context; 