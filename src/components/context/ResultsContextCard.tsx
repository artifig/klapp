'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
    completedCategories = [],
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

export default ResultsContextCard; 