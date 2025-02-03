'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AirtableMethodAnswer, AirtableMethodCategory, AirtableMethodQuestion } from '@/lib/airtable';
import { useEffect, useMemo, useState } from 'react';
import type { Category, Answer } from '@/state/AssessmentState';

interface Props {
  initialData: {
    categories: AirtableMethodCategory[];
    questions: AirtableMethodQuestion[];
    answers: AirtableMethodAnswer[];
  };
}

interface CategoryItemProps {
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

interface AnswerOptionProps {
  answer: AirtableMethodAnswer;
  isSelected: boolean;
  onClick: () => void;
}

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
  const answerText = locale === 'et' ? answer.answerText_et : answer.answerText_en;
  const answerDescription = locale === 'et' ? answer.answerDescription_et : answer.answerDescription_en;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${isSelected
        ? 'border-primary bg-primary-50 text-primary'
        : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-full border ${isSelected ? 'border-primary' : 'border-gray-300'
            }`}
        >
          {answer.answerScore}
        </div>
        <div className="flex-1">
          <div className="font-medium">{answerText}</div>
          {answerDescription && (
            <div className="mt-1 text-sm text-gray-500">{answerDescription}</div>
          )}
        </div>
      </div>
    </button>
  );
};

export function Client({ initialData }: Props) {
  const t = useTranslations('assessment');
  const locale = useLocale();

  // Local state
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Category['questions'][0] | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);

  // Transform categories
  const categories = useMemo(() => {
    return initialData.categories.map((cat, index) => {
      const categoryQuestions = initialData.questions
        .filter(q => q.MethodCategories.includes(cat.id))
        .map((q, qIndex) => ({
          id: q.id,
          airtableId: q.id,
          text: locale === 'et' ? q.questionText_et : q.questionText_en,
          categoryId: q.MethodCategories,
          answerId: q.MethodAnswers,
          order: qIndex
        }));

      return {
        id: cat.id,
        key: cat.categoryId,
        name: locale === 'et' ? cat.categoryText_et : cat.categoryText_en,
        order: index,
        questions: categoryQuestions,
        companyType: cat.companyType,
        description: locale === 'et' ? cat.categoryDescription_et : cat.categoryDescription_en
      };
    });
  }, [initialData.categories, initialData.questions, locale]);

  // Initialize first category and question
  useEffect(() => {
    if (categories.length > 0 && !currentCategory) {
      const firstCategory = categories[0];
      setCurrentCategory(firstCategory);
      setCurrentQuestion(firstCategory.questions[0]);
    }
  }, [categories, currentCategory]);

  // Get answers for current question
  const currentQuestionAnswers = useMemo(() => {
    if (!currentQuestion) return [];

    console.log('🎯 Getting answers for question:', {
      questionId: currentQuestion.id,
      answerIds: currentQuestion.answerId,
      availableAnswers: initialData.answers.length
    });

    return initialData.answers.filter(
      answer => currentQuestion.answerId.includes(answer.id) && answer.isActive === true
    );
  }, [currentQuestion, initialData.answers]);

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    const firstUnansweredQuestion = category.questions.find(q => !answers[q.id]);
    setCurrentCategory(category);
    setCurrentQuestion(firstUnansweredQuestion || category.questions[0]);
  };

  // Handle answer selection
  const handleAnswer = (answerId: string, score: number) => {
    if (!currentQuestion || !currentCategory) return;

    // Save answer
    const newAnswer = {
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

    // Check if category is completed
    const isLastQuestionInCategory = currentCategory.questions.every(
      q => q.id === currentQuestion.id || answers[q.id]
    );

    if (isLastQuestionInCategory) {
      // Move to next category
      setCompletedCategories(prev => [...prev, currentCategory.id]);
      const currentIndex = categories.findIndex(c => c.id === currentCategory.id);
      const nextCategory = categories[currentIndex + 1];

      if (nextCategory) {
        handleCategorySelect(nextCategory);
      }
    } else {
      // Move to next question
      const currentIndex = currentCategory.questions.findIndex(q => q.id === currentQuestion.id);
      setCurrentQuestion(currentCategory.questions[currentIndex + 1]);
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
                {currentQuestionAnswers.map(answer => (
                  <AnswerOption
                    key={answer.id}
                    answer={answer}
                    isSelected={answers[currentQuestion.id]?.answerId === answer.id}
                    onClick={() => handleAnswer(answer.id, answer.answerScore)}
                  />
                ))}
              </div>

              <div className="text-sm text-gray-500">
                {t('questionProgress', {
                  current: currentCategory.questions.findIndex(q => q.id === currentQuestion.id) + 1,
                  total: currentCategory.questions.length
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