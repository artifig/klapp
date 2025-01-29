'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';

type Question = {
  id: string;
  category: string;
  text: string;
  options: {
    id: string;
    text: string;
    value: number;
  }[];
};

// Example questions - in production these would come from an API/database
const questions: Question[] = [
  {
    id: '1',
    category: 'data',
    text: 'How do you currently manage and prepare data for AI/ML applications?',
    options: [
      { id: '1a', text: 'No systematic data collection or preparation', value: 0 },
      { id: '1b', text: 'Basic data collection but no standardization', value: 1 },
      { id: '1c', text: 'Structured data collection with some preprocessing', value: 2 },
      { id: '1d', text: 'Advanced data pipelines with quality controls', value: 3 }
    ]
  },
  {
    id: '2',
    category: 'ai_expertise',
    text: 'What is your current AI/ML expertise level?',
    options: [
      { id: '2a', text: 'No AI/ML expertise in-house', value: 0 },
      { id: '2b', text: 'Basic understanding of AI/ML concepts', value: 1 },
      { id: '2c', text: 'Dedicated AI/ML team or specialists', value: 2 },
      { id: '2d', text: 'Advanced AI/ML capabilities and experience', value: 3 }
    ]
  }
];

export default function AssessmentPage() {
  const t = useTranslations();
  const {state, setAnswer} = useAssessment();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(state.answers);
  const [showError, setShowError] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  const handleAnswer = (questionId: string, optionId: string) => {
    const newAnswers = {...answers, [questionId]: optionId};
    setAnswers(newAnswers);
    setAnswer(questionId, optionId);
    setShowError(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowError(false);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    if (Object.keys(answers).length < questions.length) {
      e.preventDefault();
      setShowError(true);
      return;
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <PageWrapper>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Page Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            {t('assessment.title')}
          </h1>
          <p className="text-gray-400">
            {t('assessment.progress')}: {Math.round(progress)}%
          </p>
        </div>

        {/* Main Content Card */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <div className="text-sm text-orange-500 uppercase tracking-wider mb-2">
                {currentQuestion.category}
              </div>
              <CardTitle>{currentQuestion.text}</CardTitle>
              {showError && (
                <p className="text-red-500 text-sm mt-2">
                  {t('assessment.completeAllQuestions')}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {currentQuestion.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                    className={`w-full p-4 text-left border transition-all duration-300 ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-800 text-white font-medium 
                  hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('assessment.previousQuestion')}
              </button>
              
              {isComplete && (
                <Link
                  href={routes.results}
                  onClick={handleComplete}
                  className="px-8 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                    shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
                >
                  {t('assessment.complete')}
                </Link>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
} 