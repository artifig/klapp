'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import type { Category, Question, Answer, LocalizedText } from '@/lib/airtable/types';
import { useEffect, useMemo, useState } from 'react';
import { useAssessment } from '@/state';
import { useRouter } from '@/i18n/navigation';

interface Props {
  initialData: {
    categories: Category[];
    questions: Question[];
    answers: Answer[];
  };
}

const getLocalizedText = (text: LocalizedText, locale: string): string => {
  return text[locale as keyof LocalizedText] || '';
};

// Shuffle utility remains the same
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function Client({ initialData }: Props) {
  const locale = useLocale();
  const t = useTranslations('assessment');
  const router = useRouter();
  const {
    forms,
    assessment: { answers: savedAnswers },
    setAnswer,
  } = useAssessment();

  // Redirect if no company type is selected
  useEffect(() => {
    if (!forms.setup.companyType) {
      router.push('/setup');
    }
  }, [forms.setup.companyType, router]);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledAnswersMap, setShuffledAnswersMap] = useState<Record<string, Answer[]>>({});

  // Transform and organize data with company type filtering
  const categories = useMemo(() => {
    return initialData.categories
      .filter(cat => Array.isArray(cat.companyType) && cat.companyType.includes(forms.setup.companyType))
      .map(cat => ({
        ...cat,
        name: getLocalizedText(cat.text, locale),
        description: cat.description ? getLocalizedText(cat.description, locale) : undefined
      }));
  }, [initialData.categories, forms.setup.companyType, locale]);

  const questions = useMemo(() => {
    return initialData.questions.map(q => ({
      ...q,
      text: getLocalizedText(q.text, locale)
    }));
  }, [initialData.questions, locale]);

  // Get current category's questions
  const currentCategory = categories[currentCategoryIndex];
  const categoryQuestions = useMemo(() => {
    if (!currentCategory) return [];
    return questions.filter(q => q.categories.includes(currentCategory.id));
  }, [currentCategory, questions]);

  const currentQuestion = categoryQuestions[currentQuestionIndex];

  // Calculate progress
  const totalQuestions = useMemo(() => {
    return categories.reduce((total, category) => {
      return total + questions.filter(q => q.categories.includes(category.id)).length;
    }, 0);
  }, [categories, questions]);

  const answeredQuestions = Object.keys(savedAnswers).length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  const handleAnswer = (answerId: string, score: number) => {
    if (!currentQuestion) return;

    setAnswer(currentQuestion.id, answerId, score);

    // Move to next question or category
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Assessment completed
      router.push('/results');
    }
  };

  if (!currentCategory || !currentQuestion) {
    return null;
  }

  // Get shuffled answers for current question
  const currentAnswers = shuffledAnswersMap[currentQuestion.id] || (() => {
    const filteredAnswers = initialData.answers.filter(
      answer => currentQuestion.answers.includes(answer.id) && answer.isActive
    );
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
              {categories.map((category, index) => {
                const categoryQuestions = questions.filter(q => q.categories.includes(category.id));
                const answeredInCategory = categoryQuestions.filter(q => savedAnswers[q.id]).length;
                const isComplete = answeredInCategory === categoryQuestions.length;
                const isCurrent = index === currentCategoryIndex;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setCurrentCategoryIndex(index);
                      setCurrentQuestionIndex(0);
                    }}
                    className={`p-3 rounded-lg text-left transition-colors ${isCurrent
                        ? 'bg-primary text-white'
                        : isComplete
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <div className="text-sm font-medium truncate">
                      {category.name}
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-1">
                      {isComplete ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{t('completed')}</span>
                        </>
                      ) : (
                        <span>{answeredInCategory}/{categoryQuestions.length}</span>
                      )}
                    </div>
                  </button>
                );
              })}
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
                onClick={() => handleAnswer(answer.id, answer.score)}
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