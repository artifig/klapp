'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';
import { AirtableMethodAnswer } from '@/lib/airtable';
import { useState, useEffect } from 'react';
import type { AssessmentState, Category, Question } from '@/context/AssessmentContext';

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
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        isSelected
          ? 'border-primary bg-primary-50 text-primary'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-full border ${
            isSelected ? 'border-primary' : 'border-gray-300'
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

export const AssessmentInteractiveCard = () => {
  const t = useTranslations('assessment');
  const {
    currentCategory,
    currentQuestion,
    setAnswer,
    getAnswerForQuestion,
    moveToNextQuestion,
    progress,
    methodAnswers,
    setState
  } = useAssessmentContext();

  // Add state for randomized answers
  const [randomizedAnswers, setRandomizedAnswers] = useState<AirtableMethodAnswer[]>([]);

  // Update randomized answers when the question changes
  useEffect(() => {
    if (currentQuestion) {
      console.log('🔍 Current Question Data:', {
        id: currentQuestion.id,
        text: currentQuestion.text,
        answerIds: currentQuestion.answerId
      });

      console.log('📚 Available Method Answers:', {
        total: methodAnswers.length,
        sample: methodAnswers.slice(0, 2).map(a => ({
          id: a.id,
          answerId: a.answerId,
          text: a.answerText_en
        }))
      });

      // Get all answers for this question
      const answers = methodAnswers.filter((answer: AirtableMethodAnswer) => {
        console.log('🔄 Checking answer match:', {
          currentQuestionId: currentQuestion.id,
          currentQuestionAirtableId: currentQuestion.airtableId,
          answerQuestionIds: answer.questionId,
          answerText: answer.answerText_en,
          isActive: answer.isActive
        });
        return answer.questionId?.includes(currentQuestion.airtableId) && answer.isActive === true;
      });
      
      console.log('✅ Filtered Answers:', {
        total: answers.length,
        answers: answers.map(a => ({
          id: a.id,
          answerId: a.answerId,
          text: a.answerText_en,
          score: a.answerScore
        }))
      });

      // Randomize the answers
      const shuffled = [...answers].sort(() => Math.random() - 0.5);
      setRandomizedAnswers(shuffled);
    }
  }, [currentQuestion, methodAnswers]);

  if (!currentCategory || !currentQuestion) {
    return (
      <ClientOnly>
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
      </ClientOnly>
    );
  }

  const handleAnswer = (score: number) => {
    // Set the answer and move to next question in one update
    setState((prev: AssessmentState) => {
      const currentCategory = prev.currentCategory;
      const currentQuestion = prev.currentQuestion;
      
      if (!currentCategory || !currentQuestion) return prev;

      // Update answers
      const newAnswers = { ...prev.answers, [currentQuestion.id]: score };
      
      // Move to next question immediately
      const currentQuestionIndex = currentCategory.questions.findIndex(q => q.id === currentQuestion.id);
      const nextQuestion = currentCategory.questions[currentQuestionIndex + 1];
      
      // Check if all questions in current category are now answered
      const allCategoryQuestionsAnswered = currentCategory.questions.every((q: Question) => 
        q.id === currentQuestion.id ? true : !!newAnswers[q.id]
      );

      // If there's a next question and not all questions are answered, move to it
      if (nextQuestion && !allCategoryQuestionsAnswered) {
        return { ...prev, answers: newAnswers, currentQuestion: nextQuestion };
      }

      // If all questions are answered or this is the last question, try to move to next category
      if (allCategoryQuestionsAnswered || !nextQuestion) {
        const currentCategoryIndex = prev.categories.findIndex((c: Category) => c.id === currentCategory.id);
        const nextCategory = prev.categories[currentCategoryIndex + 1];

        // Only add to completed categories if not already there
        const newCompletedCategories = prev.completedCategories.includes(currentCategory.id)
          ? prev.completedCategories
          : [...prev.completedCategories, currentCategory.id];

        if (nextCategory) {
          return {
            ...prev,
            answers: newAnswers,
            completedCategories: newCompletedCategories,
            currentCategory: nextCategory,
            currentQuestion: nextCategory.questions[0]
          };
        } else {
          return {
            ...prev,
            answers: newAnswers,
            completedCategories: newCompletedCategories,
            currentCategory: null,
            currentQuestion: null
          };
        }
      }

      return { ...prev, answers: newAnswers };
    });
  };

  const currentAnswer = getAnswerForQuestion(currentQuestion.id);

  // Filter answers based on the question's answerId array
  const questionAnswers = !currentQuestion.answerId?.length 
    ? methodAnswers // Show all answers if no specific answers are linked
    : methodAnswers.filter((answer: AirtableMethodAnswer) => 
        currentQuestion.answerId?.includes(answer.answerId)
      );

  return (
    <ClientOnly>
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
    </ClientOnly>
  );
};

export default AssessmentInteractiveCard; 