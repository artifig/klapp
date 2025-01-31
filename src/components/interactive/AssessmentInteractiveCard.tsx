'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';
import { AirtableMethodAnswer } from '@/lib/airtable';

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
    methodAnswers
  } = useAssessmentContext();

  if (!currentCategory || !currentQuestion) {
    return (
      <ClientOnly>
        <Card>
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
        </Card>
      </ClientOnly>
    );
  }

  const handleAnswer = (value: number) => {
    setAnswer(currentQuestion.id, value);
  };

  const currentAnswer = getAnswerForQuestion(currentQuestion.id);
  
  console.log('Question-Answer relationship:', {
    question: {
      id: currentQuestion.id,
      answerId: currentQuestion.answerId || []
    },
    availableAnswers: methodAnswers.map(a => ({
      id: a.id,
      text: a.answerText_en,
      score: a.answerScore
    }))
  });

  // Filter answers based on the question's answerId array
  const questionAnswers = !currentQuestion.answerId?.length 
    ? methodAnswers // Show all answers if no specific answers are linked
    : methodAnswers.filter((answer: AirtableMethodAnswer) => 
        currentQuestion.answerId?.includes(answer.id)
      );

  console.log('AssessmentInteractiveCard state:', {
    currentQuestionId: currentQuestion.id,
    totalMethodAnswers: methodAnswers.length,
    filteredAnswers: questionAnswers.length,
    currentAnswer,
    questionAnswerIds: questionAnswers.map(a => a.id),
    questionAnswerScores: questionAnswers.map(a => a.answerScore)
  });

  return (
    <ClientOnly>
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {currentCategory.name}
            </h3>
            <p className="mt-2 text-gray-600">{currentQuestion.text}</p>
          </div>

          <div className="space-y-3">
            {questionAnswers.map((answer: AirtableMethodAnswer) => (
              <AnswerOption
                key={answer.id}
                answer={answer}
                isSelected={currentAnswer === answer.answerScore}
                onClick={() => handleAnswer(answer.answerScore)}
              />
            ))}
          </div>

          {currentAnswer && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {t('questionProgress', {
                  current: currentCategory.questions.findIndex(q => q.id === currentQuestion.id) + 1,
                  total: currentCategory.questions.length
                })}
              </div>
              <button
                onClick={moveToNextQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t('nextQuestion')}
              </button>
            </div>
          )}
        </div>
      </Card>
    </ClientOnly>
  );
};

export default AssessmentInteractiveCard; 