'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { useAssessment } from '@/state/assessment-state';
import { useMemo, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { Category, Question, Answer } from '@/lib/airtable/types';

interface Props {
  initialData: {
    categories: Category[];
    questions: Question[];
    answers: Answer[];
  };
}

export function ResultsClient({ initialData }: Props) {
  const t = useTranslations('results');
  const {
    assessment: { answers },
    reference: { categories },
    forms: { setup },
    dispatch
  } = useAssessment();

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

  // Filter categories for the selected company type
  const relevantCategories = useMemo(() => {
    return categories.filter(category =>
      Array.isArray(category.companyType) &&
      category.companyType.includes(setup.companyType)
    );
  }, [categories, setup.companyType]);

  // Calculate overall score and stats
  const stats = useMemo(() => {
    // Get all answers for this company type
    const answeredQuestions = Object.values(answers);
    const relevantAnswers = answeredQuestions.filter(answer => {
      const category = relevantCategories.find(cat => cat.id === answer.categoryId);
      return category !== undefined;
    });

    // Each answer already has a percentage score (0, 33, 67, 100)
    // Calculate the average percentage across all answers
    const averagePercentageScore = relevantAnswers.length > 0
      ? relevantAnswers.reduce((sum, answer) => sum + answer.score, 0) / relevantAnswers.length
      : 0;

    console.log('Score calculation:', {
      numberOfAnswers: relevantAnswers.length,
      totalPossibleQuestions: relevantCategories.reduce((sum, category) =>
        sum + (category.questions?.length || 0), 0
      ),
      averagePercentageScore: Math.round(averagePercentageScore)
    });

    return {
      averagePercentageScore: Math.round(averagePercentageScore),
      answeredQuestionsCount: relevantAnswers.length,
      totalCategoriesCount: relevantCategories.length
    };
  }, [answers, relevantCategories]);

  // Calculate per-category scores for radar chart
  const categoryScores = useMemo(() => {
    const scores = relevantCategories.map(category => {
      // Get all answers for this category
      const categoryAnswers = Object.values(answers).filter(
        answer => answer.categoryId === category.id
      );

      // Calculate average percentage score for this category
      const categoryAveragePercentage = categoryAnswers.length > 0
        ? categoryAnswers.reduce((sum, answer) => sum + answer.score, 0) / categoryAnswers.length
        : 0;

      return {
        id: category.id,
        category: category.name,
        percentageScore: Math.round(categoryAveragePercentage),
        answeredCount: categoryAnswers.length,
        totalQuestions: category.questions?.length || 0
      };
    });

    return scores;
  }, [relevantCategories, answers]);

  // Get recommendations based on scores (categories below 50%)
  const recommendations = useMemo(() => {
    return categoryScores
      .filter(cat => cat.percentageScore < 50)
      .sort((a, b) => a.percentageScore - b.percentageScore)
      .slice(0, 3);
  }, [categoryScores]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Main Results Card */}
      <Card className="w-full">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('title')}
            </h1>
            <p className="text-gray-600">
              {setup.companyName}
            </p>
          </div>

          {/* Overall Score */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {stats.averagePercentageScore}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('overallScore')}
                  </div>
                </div>
              </div>
              {/* Add circular progress indicator here if desired */}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {[
              {
                value: stats.answeredQuestionsCount,
                label: t('questionsAnswered')
              },
              {
                value: stats.totalCategoriesCount,
                label: t('categoriesAssessed')
              },
              {
                value: `${stats.averagePercentageScore}%`,
                label: t('averageScore')
              }
            ].map((stat, index) => (
              <div key={`stat-${index}`} className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={categoryScores}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name={t('score')}
                  dataKey="percentageScore"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('areasForImprovement')}
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={`recommendation-${rec.id}`}
                  className="p-4 rounded-lg bg-orange-50 border border-orange-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {index + 1}. {rec.category}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {t('currentScore')}: {rec.percentageScore}%
                      </div>
                    </div>
                    <div className="text-orange-600">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Report Button */}
          <div className="flex justify-center pt-4">
            <button
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              onClick={() => {
                // Implement report download functionality
                console.log('Download report');
              }}
            >
              {t('downloadReport')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 