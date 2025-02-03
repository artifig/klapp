'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAssessment } from '@/state/AssessmentState';
import type { UserAnswer } from '@/state/AssessmentState';
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
  // Get questions for this category
  const questionIds = category.questions;

  console.log('🔍 Debug - Category Questions:', {
    categoryId: category.id,
    categoryText: category.text,
    questionsFound: questionIds.length,
    questionIds,
    totalAnswers: Object.keys(answers).length
  });

  // Get answered questions and their scores
  const answeredQuestions = questionIds.filter(question => {
    const hasAnswer = !!answers[question];
    console.log('🔍 Debug - Question Answer:', {
      questionId: question,
      hasAnswer,
      answer: answers[question]
    });
    return hasAnswer;
  });

  const totalScore = answeredQuestions.reduce((sum, question) => {
    const answer = answers[question];
    console.log('🎯 Debug - Answer Score:', {
      questionId: question,
      hasAnswer: !!answer,
      score: answer?.score || 0
    });
    return sum + (answer?.score || 0);
  }, 0);

  // Calculate max possible score (5 points per question)
  const maxScore = questionIds.length * 5;

  // Calculate percentage (only if there are questions)
  const percentage = questionIds.length > 0
    ? (totalScore / maxScore) * 100
    : 0;

  const result = {
    categoryId: category.id,
    name: getLocalizedText(category.text, locale),
    score: percentage,
    totalScore,
    maxScore,
    level: getReadinessLevel(percentage),
    answeredQuestions: answeredQuestions.length,
    totalQuestions: questionIds.length
  };

  console.log('🎯 Debug - Category Score Result:', result);

  return result;
}

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
  const { answers, setAssessmentData } = useAssessment();
  const hasInitialized = useRef(false);

  // Initialize assessment data only once
  useEffect(() => {
    if (!hasInitialized.current) {
      setAssessmentData(initialData.categories, initialData.questions, initialData.answers);
      hasInitialized.current = true;
    }
  }, [initialData, setAssessmentData]);

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