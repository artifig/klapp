'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAssessment, type UserAnswer } from '@/state';
import type { Answer, Category, Question, LocalizedText } from '@/lib/airtable/types';
import { useMemo, useEffect, useRef } from 'react';

interface CategoryScore {
  categoryId: string;
  name: string;
  score: number;
  totalScore: number;
  maxScore: number;
  level: 'red' | 'yellow' | 'green';
  answeredQuestions: number;
  totalQuestions: number;
}

const getReadinessLevel = (score: number): 'red' | 'yellow' | 'green' => {
  if (score < 40) return 'red';
  if (score < 70) return 'yellow';
  return 'green';
};

const getLocalizedText = (text: LocalizedText, locale: string): string => {
  return text[locale as keyof LocalizedText] || '';
};

const calculateCategoryScore = (
  category: Category,
  answers: Record<string, UserAnswer>,
  locale: string
): CategoryScore => {
  const questionIds = category.questions;
  const answeredQuestions = questionIds.filter(question => !!answers[question]);
  const totalScore = answeredQuestions.reduce((sum, question) => {
    const answer = answers[question];
    return sum + (answer?.score || 0);
  }, 0);

  const maxScore = questionIds.length * 5;
  const percentage = questionIds.length > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    categoryId: category.id,
    name: getLocalizedText(category.text, locale),
    score: percentage,
    totalScore,
    maxScore,
    level: getReadinessLevel(percentage),
    answeredQuestions: answeredQuestions.length,
    totalQuestions: questionIds.length
  };
};

interface Props {
  initialData: {
    categories: Category[];
    questions: Question[];
    answers: Answer[];
  };
}

export function ResultsClient({ initialData }: Props) {
  const t = useTranslations('results');
  const router = useRouter();
  const locale = useLocale();
  const { assessment: { answers } } = useAssessment();
  const hasInitialized = useRef(false);

  // Initialize assessment data only once
  useEffect(() => {
    if (!hasInitialized.current) {
      // Instead of setAssessmentData, we'll handle this in the reducer
      hasInitialized.current = true;
    }
  }, [initialData]);

  // Calculate scores for each category
  const categoryScores = useMemo(() => {
    return initialData.categories.map(category =>
      calculateCategoryScore(category, answers, locale)
    );
  }, [initialData.categories, answers, locale]);

  // Filter categories that have answers
  const categoriesWithAnswers = categoryScores.filter(cat => cat.answeredQuestions > 0);

  // Calculate overall score (average of categories with answers)
  const overallScore = categoriesWithAnswers.length > 0
    ? categoriesWithAnswers.reduce((sum, category) => sum + category.score, 0) / categoriesWithAnswers.length
    : 0;
  const overallLevel = getReadinessLevel(overallScore);

  // Calculate completion percentage
  const totalAnswered = categoryScores.reduce((sum, cat) => sum + cat.answeredQuestions, 0);
  const totalQuestions = categoryScores.reduce((sum, cat) => sum + cat.totalQuestions, 0);
  const completionPercentage = totalQuestions > 0
    ? (totalAnswered / totalQuestions) * 100
    : 0;

  return (
    <div>
      <h1>{t('title')}</h1>

      {/* Overall Score */}
      <div>
        <h2>Overall Score: {Math.round(overallScore)}%</h2>
        <p>Level: {t(`levels.${overallLevel}`)}</p>
        <p>{t('summary')}</p>
        <p>
          {t('completion.title')}: {Math.round(completionPercentage)}%
          ({totalAnswered}/{totalQuestions} {t('questions')})
        </p>
      </div>

      {/* Category Scores */}
      <div>
        <h2>{t('categories.title')}</h2>
        {categoryScores.map(category => (
          <div key={category.categoryId}>
            <h3>{category.name}</h3>
            <p>
              Score: {category.totalScore}/{category.maxScore} ({Math.round(category.score)}%)
            </p>
            <p>
              Questions answered: {category.answeredQuestions}/{category.totalQuestions}
            </p>
          </div>
        ))}
      </div>

      {/* Basic Actions */}
      <div>
        <button onClick={() => router.push('/assessment')}>
          {t('contextCard.backButton')}
        </button>
      </div>
    </div>
  );
} 