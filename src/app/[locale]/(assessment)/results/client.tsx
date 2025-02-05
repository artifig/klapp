'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/state/assessment-state';
import { useMemo, useEffect, useCallback } from 'react';
import { updateAssessmentResults } from '@/lib/airtable/mutations';
import type { Category } from '@/lib/airtable/types';
import { Card, CardContent } from '@/components/ui/Card';

interface Props {
  initialData: {
    categories: Category[];
    answers: {
      id: string;
      text: { et: string; en: string };
      description?: { et: string; en: string };
      score: number;
      isActive: boolean;
      questions: string[];
    }[];
  };
}

export function ResultsClient({ initialData }: Props) {
  const t = useTranslations('results');
  const router = useRouter();
  const {
    assessment: { answers },
    reference: { categories, methodAnswers },
    forms: { setup, goal },
    dispatch
  } = useAssessment();

  // All hooks must be called before any conditional returns
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.companyType.includes(setup.companyType)
    );
  }, [categories, setup.companyType]);

  const categoryScores = useMemo(() => {
    return filteredCategories.map(category => {
      const categoryAnswers = Object.values(answers).filter(
        answer => answer.categoryId === category.id
      );

      const totalScore = categoryAnswers.reduce((sum, answer) =>
        sum + answer.score, 0
      );

      return {
        id: category.id,
        name: category.name,
        averageScore: categoryAnswers.length > 0
          ? (totalScore / categoryAnswers.length) * 100
          : 0,
        questions: category.questions.map(questionId => {
          const answer = answers[questionId];
          if (!answer) return null;

          const methodAnswer = methodAnswers.find(a => a.id === answer.answerId);
          if (!methodAnswer) return null;

          return {
            id: questionId,
            text: category.name, // Using category name as we don't have question text
            answer: {
              id: answer.answerId,
              text: methodAnswer.text.et, // Using Estonian text for now
              score: answer.score,
              timestamp: answer.timestamp
            }
          };
        }).filter((q): q is NonNullable<typeof q> => q !== null)
      };
    });
  }, [filteredCategories, answers, methodAnswers]);

  const overallScore = useMemo(() => {
    if (categoryScores.length === 0) return 0;
    return categoryScores.reduce((sum, category) =>
      sum + category.averageScore, 0
    ) / categoryScores.length;
  }, [categoryScores]);

  const questionCounts = useMemo(() => {
    const totalQuestions = filteredCategories.reduce((sum, category) =>
      sum + category.questions.length, 0
    );
    return {
      total: totalQuestions,
      answered: Object.keys(answers).length
    };
  }, [filteredCategories, answers]);

  const saveResults = useCallback(async () => {
    if (!goal.recordId) {
      console.error('No record ID found');
      return;
    }

    try {
      const response = await updateAssessmentResults({
        recordId: goal.recordId,
        responseContent: {
          metadata: {
            overallScore,
            totalQuestions: questionCounts.total,
            answeredQuestions: questionCounts.answered
          },
          categories: categoryScores
        }
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      console.log('Results saved successfully');
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }, [goal.recordId, overallScore, questionCounts, categoryScores]);

  // Redirect if no goal record ID is found
  useEffect(() => {
    if (!goal.recordId) {
      console.log('No record ID found, redirecting to assessment');
      router.push('/assessment');
      return;
    }
  }, [goal.recordId, router]);

  // Use initialData to set up reference data if needed
  useEffect(() => {
    if (initialData.categories.length > 0) {
      dispatch({
        type: 'SET_REFERENCE',
        payload: {
          categories: initialData.categories,
          methodAnswers: initialData.answers
        }
      });
    }
  }, [initialData, dispatch]);

  // Save results when component mounts
  useEffect(() => {
    saveResults();
  }, [saveResults]);

  // If no record ID, don't render anything while redirecting
  if (!goal.recordId) {
    return null;
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('overallScore')}</h2>
            <div className="text-4xl font-bold text-primary">
              {Math.round(overallScore)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {questionCounts.answered} / {questionCounts.total} {t('questionsAnswered')}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('categoryScores')}</h2>
            <div className="space-y-4">
              {categoryScores.map(category => (
                <div key={category.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <span className="text-lg font-semibold">
                      {Math.round(category.averageScore)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${category.averageScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 