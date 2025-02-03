'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Category, Question, Answer, LocalizedText } from '@/lib/airtable/types';
import { useEffect, useMemo, useState } from 'react';
import type { UserAnswer } from '@/state/AssessmentState';

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

export function Client({ initialData }: Props) {
  const locale = useLocale();
  const t = useTranslations('assessment');

  // Local state
  const [currentCategory, setCurrentCategory] = useState<TransformedCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<TransformedQuestion | null>(null);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);

  // Transform and organize data
  const categories = useMemo(() => {
    return initialData.categories.map(cat => ({
      ...cat,
      name: getLocalizedText(cat.text, locale),
      description: cat.description ? getLocalizedText(cat.description, locale) : undefined
    }));
  }, [initialData.categories, locale]);

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

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answerId,
      score,
      categoryId: currentCategory.id,
      timestamp: new Date().toISOString()
    };

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: newAnswer
    }));

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
          {currentCategory && currentQuestion ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {currentCategory.name}
                </h3>
                <p className="mt-2 text-gray-600">{currentQuestion.text}</p>
              </div>

              <div className="space-y-3">
                {initialData.answers.filter(
                  answer => currentQuestion.answers.includes(answer.id) && answer.isActive
                ).map(answer => (
                  <AnswerOption
                    key={answer.id}
                    answer={answer}
                    isSelected={answers[currentQuestion.id]?.answerId === answer.id}
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