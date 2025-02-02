'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAssessmentState } from '@/state/AssessmentState';
import { AirtableMethodAnswer, AirtableMethodCategory, AirtableMethodQuestion } from '@/lib/airtable';
import { useState, useEffect, useMemo } from 'react';
import type { Category } from '@/state/AssessmentState';

interface InteractiveProps {
  initialData: {
    categories: AirtableMethodCategory[];
    questions: AirtableMethodQuestion[];
    answers: AirtableMethodAnswer[];
  };
}

interface AnswerOptionProps {
  answer: AirtableMethodAnswer;
  isSelected: boolean;
  onClick: () => void;
}

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

// Helper function to transform Airtable data to Category type
function transformCategories(
  categories: AirtableMethodCategory[],
  questions: AirtableMethodQuestion[],
  locale: string
): Category[] {
  return categories.map((cat, index) => {
    // Get questions for this category
    const categoryQuestions = questions
      .filter(q => q.MethodCategories.includes(cat.id))
      .map((q, qIndex) => ({
        id: q.id,
        airtableId: q.questionId,
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
}

export const Interactive = ({ initialData }: InteractiveProps) => {
  const t = useTranslations('assessment');
  const locale = useLocale();
  const {
    currentCategory,
    currentQuestion,
    getAnswerForQuestion,
    moveToNextQuestion,
    moveToNextCategory,
    setAnswer,
    progress,
    setAssessmentData
  } = useAssessmentState();

  // Memoize transformed categories
  const transformedCategories = useMemo(() =>
    transformCategories(initialData.categories, initialData.questions, locale),
    [initialData.categories, initialData.questions, locale]
  );

  // Track initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize assessment data only once
  useEffect(() => {
    if (!isInitialized) {
      setAssessmentData(transformedCategories, initialData.answers);
      setIsInitialized(true);
    }
  }, [isInitialized, transformedCategories, initialData.answers, setAssessmentData]);

  // Add state for randomized answers
  const [randomizedAnswers, setRandomizedAnswers] = useState<AirtableMethodAnswer[]>([]);

  // Memoize filtered answers for current question
  const currentQuestionAnswers = useMemo(() => {
    if (!currentQuestion) return [];
    return initialData.answers.filter((answer: AirtableMethodAnswer) =>
      answer.questionId?.includes(currentQuestion.airtableId) && answer.isActive === true
    );
  }, [currentQuestion, initialData.answers]);

  // Update randomized answers when the question changes
  useEffect(() => {
    if (currentQuestionAnswers.length > 0) {
      const shuffled = [...currentQuestionAnswers].sort(() => Math.random() - 0.5);
      setRandomizedAnswers(shuffled);
    }
  }, [currentQuestionAnswers]);

  if (!currentCategory || !currentQuestion) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="sr-only">Assessment Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('noQuestionSelected')}
            </h3>
            <p className="text-gray-600">
              {progress === 1
                ? t('allQuestionsCompleted')
                : t('selectCategory')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAnswer = (score: number) => {
    if (!currentQuestion) return;

    // Set the answer
    setAnswer(currentQuestion.id, score);

    // Check if all questions in current category are now answered
    const allCategoryQuestionsAnswered = currentCategory?.questions.every(
      q => q.id === currentQuestion.id ? true : !!getAnswerForQuestion(q.id)
    );

    if (allCategoryQuestionsAnswered) {
      // If all questions are answered, move to next category
      moveToNextCategory();
    } else {
      // Otherwise, move to next question
      moveToNextQuestion();
    }
  };

  const currentAnswer = getAnswerForQuestion(currentQuestion.id);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="sr-only">Assessment Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {currentCategory.name}
            </h3>
            <p className="mt-2 text-gray-600">{currentQuestion.text}</p>
          </div>

          <div className="space-y-3">
            {randomizedAnswers.map((answer: AirtableMethodAnswer) => (
              <AnswerOption
                key={answer.id}
                answer={answer}
                isSelected={currentAnswer === answer.answerScore}
                onClick={() => handleAnswer(answer.answerScore)}
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
      </CardContent>
    </Card>
  );
};

export default Interactive; 