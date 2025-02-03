'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/state/AssessmentState';

const getReadinessLevel = (score: number) => {
  if (score < 40) return 'red';
  if (score < 70) return 'yellow';
  return 'green';
};

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
      level: getReadinessLevel(percentage)
    };
  });

  // Calculate overall score
  const overallScore = categoryScores.reduce((sum, category) => sum + category.score, 0) / categoryScores.length;
  const overallLevel = getReadinessLevel(overallScore);

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${overallLevel === 'red' ? 'text-red-500' :
                overallLevel === 'yellow' ? 'text-yellow-500' :
                  'text-green-500'
              }`}>
              {Math.round(overallScore)}%
            </div>
            <div className="text-lg font-medium">
              {t(`levels.${overallLevel}`)}
            </div>
            <p className="text-gray-600">{t('summary')}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Scores */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('categories.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryScores.map(category => (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">{category.name}</h3>
                    <span className={`text-sm ${category.level === 'red' ? 'text-red-500' :
                        category.level === 'yellow' ? 'text-yellow-500' :
                          'text-green-500'
                      }`}>
                      {category.totalScore}/{category.maxScore} ({Math.round(category.score)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${category.level === 'red' ? 'bg-red-500' :
                          category.level === 'yellow' ? 'bg-yellow-500' :
                            'bg-green-500'
                        }`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('contextCard.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{t('contextCard.description')}</p>
              <div className="space-y-2">
                <Button onClick={() => console.log('Download PDF')} className="w-full">
                  {t('downloadReport')}
                </Button>
                <Button onClick={() => console.log('Email Results')} className="w-full" variant="outline">
                  {t('emailResults')}
                </Button>
                <Button onClick={() => router.push('/assessment')} className="w-full" variant="outline">
                  {t('contextCard.backButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 