'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';

interface AnswerOptionProps {
  value: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const AnswerOption = ({ value, label, isSelected, onClick }: AnswerOptionProps) => (
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
        {value}
      </div>
      <span className="flex-1">{label}</span>
    </div>
  </button>
);

export const AssessmentInteractiveCard = () => {
  const t = useTranslations('Assessment');
  const {
    currentCategory,
    currentQuestion,
    setAnswer,
    getAnswerForQuestion,
    moveToNextQuestion,
  } = useAssessmentContext();

  if (!currentCategory || !currentQuestion) {
    return (
      <Card>
        <div className="text-center text-gray-500">
          {t('noQuestionSelected')}
        </div>
      </Card>
    );
  }

  const handleAnswer = (value: number) => {
    setAnswer(currentQuestion.id, value);
    moveToNextQuestion();
  };

  const currentAnswer = getAnswerForQuestion(currentQuestion.id);

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {currentCategory.name}
          </h3>
          <p className="mt-2 text-gray-600">{currentQuestion.text}</p>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <AnswerOption
              key={value}
              value={value}
              label={t(`answers.${value}`)}
              isSelected={currentAnswer === value}
              onClick={() => handleAnswer(value)}
            />
          ))}
        </div>

        {currentAnswer && (
          <div className="flex justify-end">
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
  );
};

export default AssessmentInteractiveCard; 