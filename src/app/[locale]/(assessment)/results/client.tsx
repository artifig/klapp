'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/state/AssessmentState';

export function ResultsClient() {
  const t = useTranslations('results');
  const router = useRouter();
  const { answers, categories } = useAssessment();

  // Calculate category scores
  const categoryScores = categories.map(category => {
    const categoryAnswers = category.questions.map(question => answers[question.id]);
    const totalScore = categoryAnswers.reduce((sum, answer) => sum + (answer?.score || 0), 0);
    const maxScore = category.questions.length * 5; // Assuming max score per question is 5
    const percentage = (totalScore / maxScore) * 100;

    return {
      categoryId: category.id,
      name: category.name,
      score: percentage,
      totalScore,
      maxScore,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('interactiveCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categoryScores.map(category => (
              <div key={category.categoryId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">{category.name}</h3>
                  <span className="text-sm text-gray-500">
                    {category.totalScore}/{category.maxScore} ({Math.round(category.score)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${category.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('contextCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>{t('contextCard.description')}</p>
            <Button onClick={() => router.push('/assessment')} className="w-full">
              {t('contextCard.backButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 