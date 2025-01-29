'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
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

  const handleNext = (e: React.MouseEvent) => {
    if (Object.keys(answers).length < questions.length) {
      e.preventDefault();
      setShowError(true);
      return;
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <PageWrapper>
      <div className="h-full flex flex-col">
        <div className="flex-1 grid lg:grid-cols-2 gap-4">
          {/* Left Column - Progress and Information */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-4xl">{t('assessment.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('assessment.progress')}: {Math.round(progress)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 text-right">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>

                {/* Previous Answers */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{t('assessment.yourAnswers')}</h3>
                  <div className="space-y-3">
                    {questions.map((q, index) => {
                      const answered = answers[q.id];
                      const option = q.options.find(opt => opt.id === answered);
                      return (
                        <div 
                          key={q.id}
                          className={`p-3 border rounded-sm transition-colors
                            ${index === currentQuestionIndex 
                              ? 'border-orange-500 bg-orange-500/10' 
                              : answered 
                                ? 'border-gray-700 bg-gray-800/50'
                                : 'border-gray-800 bg-gray-900/50'}`}
                        >
                          <div className="text-sm font-medium text-gray-300">{q.category}</div>
                          <div className="mt-1 text-sm">
                            {answered ? (
                              <span className="text-orange-500">{option?.text}</span>
                            ) : (
                              <span className="text-gray-500">{t('assessment.notAnswered')}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <Link
                  href={routes.setup}
                  className="w-full px-6 py-2 bg-gray-800 text-white font-medium 
                    hover:bg-gray-700 transition-colors text-center"
                >
                  {t('nav.back')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Current Question */}
          {currentQuestion && (
            <Card className="flex flex-col">
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
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="grid gap-3">
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
                </div>

                <div className="mt-6">
                  {Object.keys(answers).length === questions.length ? (
                    <Link
                      href={routes.results}
                      onClick={handleNext}
                      className="w-full px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                        shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all text-center"
                    >
                      {t('nav.results')}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAnswer(currentQuestion.id, currentQuestion.options[0].id)}
                      className="w-full px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                        shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all text-center"
                      disabled={!currentQuestion}
                    >
                      {t('assessment.nextQuestion')}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 