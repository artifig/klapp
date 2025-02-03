'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Category, Question, Answer, LocalizedText } from '@/lib/airtable/types';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useAssessment } from '@/state/AssessmentState';
import { useRouter } from '@/i18n/navigation';

interface Props {
  initialData: {
    categories: Category[];
    questions: Question[];
    answers: Answer[];
  };
}

interface CategoryItemProps {
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

interface AnswerOptionProps {
  answer: Answer;
  isSelected: boolean;
  onClick: () => void;
}

interface TransformedCategory extends Omit<Category, 'description'> {
  name: string;
  description?: string;
}

interface TransformedQuestion extends Omit<Question, 'text'> {
  text: string;
}

const getLocalizedText = (text: LocalizedText, locale: string): string => {
  return text[locale as keyof LocalizedText] || '';
};

const CategoryItem = ({ name, isActive, isCompleted, onClick }: CategoryItemProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${isActive
      ? 'bg-primary text-white'
      : isCompleted
        ? 'bg-green-50 text-green-700'
        : 'hover:bg-gray-50'
      }`}
  >
    <div className="flex items-center justify-between">
      <span>{name}</span>
      {isCompleted && <span className="text-green-500">✓</span>}
    </div>
  </button>
);

const AnswerOption = ({ answer, isSelected, onClick }: AnswerOptionProps) => {
  const locale = useLocale();
  const answerText = getLocalizedText(answer.text, locale);
  const answerDescription = answer.description ? getLocalizedText(answer.description, locale) : undefined;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
        }`}
    >
      <div className="flex gap-4">
        <div
          className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
        >
          {answer.score}
        </div>
        <div className="flex-1">
          <div className="font-medium">{answerText}</div>
          {answerDescription && <div className="mt-1 text-sm text-gray-600">{answerDescription}</div>}
        </div>
      </div>
    </button>
  );
};

// Add shuffle utility function
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
  const assessment = useAssessment();
  const { formData, answers: contextAnswers, setAnswer, setAssessmentData } = assessment;
  const hasInitialized = useRef(false);

  // Redirect if no company type is selected
  useEffect(() => {
    if (!formData.companyType) {
      router.push('/setup');
    }
  }, [formData.companyType, router]);

  // Initialize assessment data only once
  useEffect(() => {
    if (!hasInitialized.current) {
      setAssessmentData(initialData.categories, initialData.questions, initialData.answers);
      hasInitialized.current = true;
    }
  }, [initialData, setAssessmentData]);

  // Local state
  const [currentCategory, setCurrentCategory] = useState<TransformedCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<TransformedQuestion | null>(null);
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [shuffledAnswersMap, setShuffledAnswersMap] = useState<Record<string, Answer[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Transform and organize data with company type filtering
  const categories = useMemo(() => {
    const filtered = initialData.categories
      .filter(cat => Array.isArray(cat.companyType) && cat.companyType.includes(formData.companyType))
      .map(cat => ({
        ...cat,
        name: getLocalizedText(cat.text, locale),
        description: cat.description ? getLocalizedText(cat.description, locale) : undefined
      }));

    console.log('🎯 Filtered categories:', {
      companyType: formData.companyType,
      totalCategories: initialData.categories.length,
      filteredCount: filtered.length,
      filtered: filtered.map(c => ({
        id: c.id,
        name: c.name,
        companyTypes: c.companyType
      }))
    });

    return filtered;
  }, [initialData.categories, formData.companyType, locale]);

  const questions = useMemo(() => {
    return initialData.questions.map(q => ({
      ...q,
      text: getLocalizedText(q.text, locale)
    }));
  }, [initialData.questions, locale]);

  // Initialize first category and question
  useEffect(() => {
    if (categories.length > 0 && !currentCategory) {
      const firstCategory = categories[0];
      setCurrentCategory(firstCategory);

      const categoryQuestions = questions.filter(q =>
        q.categories.includes(firstCategory.id)
      );

      if (categoryQuestions.length > 0) {
        setCurrentQuestion(categoryQuestions[0]);
      }
    }
  }, [categories, questions, currentCategory]);

  const handleCategorySelect = (category: TransformedCategory) => {
    setCurrentCategory(category);
    const categoryQuestions = questions.filter(q =>
      q.categories.includes(category.id)
    );

    if (categoryQuestions.length > 0) {
      setCurrentQuestion(categoryQuestions[0]);
    }
  };

  const handleAnswer = (answerId: string, score: number) => {
    if (!currentQuestion || !currentCategory) return;

    // Use the context's setAnswer instead of local state
    setAnswer(currentQuestion.id, answerId, score);

    // Find next question in current category
    const categoryQuestions = questions.filter(q =>
      q.categories.includes(currentCategory.id)
    );

    const currentIndex = categoryQuestions.findIndex(q => q.id === currentQuestion.id);
    const nextQuestion = categoryQuestions[currentIndex + 1];

    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
    } else {
      // Category completed
      setCompletedCategories(prev => [...prev, currentCategory.id]);

      // Find next uncompleted category
      const nextCategory = categories.find(cat =>
        !completedCategories.includes(cat.id) && cat.id !== currentCategory.id
      );

      if (nextCategory) {
        handleCategorySelect(nextCategory);
      } else {
        // All categories completed
        setIsCompleted(true);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Questions Panel */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="sr-only">Assessment Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('allQuestionsCompleted')}
              </h3>
              <button
                onClick={() => router.push('/results')}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                {t('viewResults')}
              </button>
            </div>
          ) : currentCategory && currentQuestion ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {currentCategory.name}
                </h3>
                <p className="mt-2 text-gray-600">{currentQuestion.text}</p>
              </div>

              <div className="space-y-3">
                {(shuffledAnswersMap[currentQuestion.id] ||
                  (() => {
                    const filteredAnswers = initialData.answers.filter(
                      answer => currentQuestion.answers.includes(answer.id) && answer.isActive
                    );
                    const shuffled = shuffleArray(filteredAnswers);
                    setShuffledAnswersMap(prev => ({
                      ...prev,
                      [currentQuestion.id]: shuffled
                    }));
                    return shuffled;
                  })()
                ).map(answer => (
                  <AnswerOption
                    key={answer.id}
                    answer={answer}
                    isSelected={contextAnswers[currentQuestion.id]?.answerId === answer.id}
                    onClick={() => handleAnswer(answer.id, answer.score)}
                  />
                ))}
              </div>

              <div className="text-sm text-gray-500">
                {t('questionProgress', {
                  current: questions.filter(q => q.categories.includes(currentCategory.id))
                    .findIndex(q => q.id === currentQuestion.id) + 1,
                  total: questions.filter(q => q.categories.includes(currentCategory.id)).length
                })}
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('noQuestionSelected')}
              </h3>
              <p className="text-gray-600">
                {t('selectCategory')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Panel */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('contextCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                name={category.name}
                isActive={category.id === currentCategory?.id}
                isCompleted={completedCategories.includes(category.id)}
                onClick={() => handleCategorySelect(category)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 