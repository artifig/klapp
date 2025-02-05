'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import type { Category, Question, Answer } from '@/lib/airtable/types';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAssessment } from '@/state/assessment-state';
import { useRouter } from '@/i18n/navigation';
import { getLocalizedText } from '@/lib/utils';

interface Props {
  initialData: {
    categories: Category[];
    questions: Question[];
    answers: Answer[];
  };
}

// Shuffle utility remains the same
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Client({ initialData }: Props) {
  const locale = useLocale();
  const t = useTranslations('assessment');
  const router = useRouter();
  const {
    assessment: { answers: savedAnswers },
    forms,
    reference,
    dispatch
  } = useAssessment();

  console.log('Current savedAnswers:', savedAnswers);

  // Track state changes
  useEffect(() => {
    console.log('State updated - savedAnswers:', savedAnswers);
  }, [savedAnswers]);

  // Initialize reference data once on mount
  useEffect(() => {
    console.log('Reference data check:', {
      hasCategories: initialData.categories.length > 0,
      referenceCategories: reference.categories.length,
      sampleCategory: initialData.categories[0], // Log a sample category
      locale // Log the current locale
    });
    if (initialData.categories.length > 0 && !reference.categories.length) {
      console.log('Initializing reference data with categories:', initialData.categories.length);

      // Transform categories to match our state type
      const transformedCategories = initialData.categories.map(category => {
        const localizedName = getLocalizedText(category.text, locale);
        console.log('Category transformation:', {
          id: category.id,
          text: category.text,
          locale,
          localizedName
        });
        return {
          id: category.id,
          key: category.id.substring(0, 8),
          name: localizedName,
          order: 0,
          questions: category.questions || [],
          companyType: category.companyType || [],
          description: category.description ? getLocalizedText(category.description, locale) : undefined
        };
      });

      console.log('Transformed categories:', transformedCategories);

      dispatch({
        type: 'SET_REFERENCE',
        payload: {
          categories: transformedCategories,
          methodAnswers: initialData.answers
        }
      });
    }
  }, [initialData.categories.length, reference.categories.length, dispatch, initialData.answers, initialData.categories, locale]);

  // Redirect if no company type is selected
  useEffect(() => {
    if (!forms.setup.companyType) {
      router.push('/setup');
    }
  }, [forms.setup.companyType, router]);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledAnswersMap, setShuffledAnswersMap] = useState<Record<string, Answer[]>>({});

  // Transform and organize data with company type filtering - memoized
  const categoriesData = useMemo(() => {
    console.log('Filtering categories for company type:', forms.setup.companyType);
    return initialData.categories
      .filter(cat => Array.isArray(cat.companyType) && cat.companyType.includes(forms.setup.companyType))
      .map(category => ({
        ...category,
        name: getLocalizedText(category.text, locale),
        description: category.description ? getLocalizedText(category.description, locale) : undefined,
        isActive: false
      }));
  }, [initialData.categories, forms.setup.companyType, locale]);

  const questions = useMemo(() => {
    return initialData.questions.map(q => ({
      ...q,
      text: getLocalizedText(q.text, locale)
    }));
  }, [initialData.questions, locale]);

  // Get current category's questions
  const currentCategory = categoriesData[currentCategoryIndex];
  const categoryQuestions = useMemo(() => {
    if (!currentCategory) return [];
    return questions.filter(q => q.categories.includes(currentCategory.id));
  }, [currentCategory, questions]);

  const currentQuestion = categoryQuestions[currentQuestionIndex];

  // Calculate total questions and progress
  const totalQuestions = useMemo(() => {
    return categoriesData.reduce((total, category) => total + category.questions.length, 0);
  }, [categoriesData]);

  const answeredQuestions = useMemo(() => {
    console.log('Calculating answered questions from:', savedAnswers);
    return Object.keys(savedAnswers).length;
  }, [savedAnswers]);

  const progress = useMemo(() => {
    const percentage = (answeredQuestions / totalQuestions) * 100;
    console.log(`Progress calculation: ${answeredQuestions} / ${totalQuestions} = ${Math.round(percentage)}%`);
    return Math.round(percentage);
  }, [answeredQuestions, totalQuestions]);

  // Memoize category questions and completion status
  const categoryStatus = useMemo(() => {
    console.log('Recalculating category status');
    return categoriesData.map((category, index) => {
      const categoryAnswers = Object.values(savedAnswers).filter(
        answer => answer.categoryId === category.id
      );
      const answered = categoryAnswers.length;
      const total = category.questions.length;
      console.log(`Category ${category.name}: ${answered} / ${total} answered`);
      return {
        ...category,
        answered,
        total,
        isComplete: answered === total,
        isCurrent: index === currentCategoryIndex
      };
    });
  }, [categoriesData, savedAnswers, currentCategoryIndex]);

  const handleAnswer = useCallback((questionId: string, answerId: string, score: number) => {
    console.log('Saving answer:', { questionId, answerId, score, previousAnswers: savedAnswers });

    // Dispatch the answer
    dispatch({
      type: 'SET_ANSWER',
      payload: { questionId, answerId, score }
    });

    // Move to next question or category
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentCategoryIndex < categoriesData.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All questions completed
      console.log('Assessment completed!');
      router.push('/results');
    }
  }, [dispatch, currentQuestionIndex, categoryQuestions.length, currentCategoryIndex, categoriesData.length, router]);

  if (!currentCategory || !currentQuestion) {
    return null;
  }

  // Get shuffled answers for current question
  const currentAnswers = shuffledAnswersMap[currentQuestion.id] || (() => {
    const filteredAnswers = initialData.answers.filter(
      answer => currentQuestion.answers.includes(answer.id)
    );
    console.log('Answer scores for question:', currentQuestion.id, filteredAnswers.map(a => a.score));
    const shuffled = shuffleArray(filteredAnswers);
    setShuffledAnswersMap(prev => ({
      ...prev,
      [currentQuestion.id]: shuffled
    }));
    return shuffled;
  })();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="w-full">
        <CardContent className="space-y-6 p-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('progress')}: {progress}%</span>
              <span>{answeredQuestions}/{totalQuestions} {t('questionsAnswered')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Categories Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('categories.title')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categoryStatus.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setCurrentCategoryIndex(categoriesData.findIndex(c => c.id === category.id));
                    setCurrentQuestionIndex(0);
                  }}
                  className={`p-3 rounded-lg text-left transition-colors ${category.isCurrent
                    ? 'bg-primary text-white'
                    : category.isComplete
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                  <div className="text-sm font-medium truncate">
                    {category.name}
                  </div>
                  <div className="text-xs mt-1 flex items-center gap-1">
                    {category.isComplete ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{t('completed')}</span>
                      </>
                    ) : (
                      <span>{category.answered}/{category.total}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category and Question */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentCategory.name}
              </h2>
              {currentCategory.description && (
                <p className="mt-1 text-gray-600 text-sm">{currentCategory.description}</p>
              )}
            </div>
            <p className="text-gray-900">{currentQuestion.text}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentAnswers.map(answer => (
              <button
                key={answer.id}
                onClick={() => handleAnswer(currentQuestion.id, answer.id, answer.score)}
                className="w-full text-left p-4 rounded-lg border transition-colors hover:border-primary/50 hover:bg-gray-50"
              >
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                    {answer.score}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {getLocalizedText(answer.text, locale)}
                    </div>
                    {answer.description && (
                      <div className="mt-1 text-sm text-gray-600">
                        {getLocalizedText(answer.description, locale)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}