'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';

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
  const t = useTranslations('Results');
  const { goal, formData, categories, answers } = useAssessmentContext();

  // Calculate category scores
  const categoryScores: CategoryScore[] = categories.map(category => {
    const categoryQuestions = category.questions;
    const answeredQuestions = categoryQuestions.filter(question => answers[question.id]);
    const totalScore = answeredQuestions.reduce((sum: number, question) => 
      sum + (answers[question.id] || 0), 0);
    const maxPossibleScore = categoryQuestions.length * 5; // Assuming 5 is max score per question
    
    return {
      category: category.name,
      score: (totalScore / maxPossibleScore) * 100
    };
  });

  // Calculate overall score
  const overallScore = categoryScores.reduce((sum: number, { score }) => sum + score, 0) / 
    (categoryScores.length || 1);

  return (
    <Card>
      <div className="space-y-6">
        {/* Assessment Info */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">
            {t('assessmentInfo')}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t('company')}:</span>{' '}
              {formData?.companyName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t('goal')}:</span>{' '}
              {goal}
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">
            {t('overallScore')}
          </h3>
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {Math.round(overallScore)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {t('maturityLevel')}
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">
            {t('categoryScores')}
          </h3>
          <div className="space-y-2">
            {categoryScores.map((result, index) => (
              <CategoryResult
                key={index}
                category={result.category}
                score={result.score}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsContextCard; 