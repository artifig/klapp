'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/Card';

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
    text: 'How do you currently manage your data?',
    options: [
      { id: '1a', text: 'No systematic data collection', value: 0 },
      { id: '1b', text: 'Basic spreadsheets and manual collection', value: 1 },
      { id: '1c', text: 'Dedicated databases but manual processes', value: 2 },
      { id: '1d', text: 'Automated data collection and storage systems', value: 3 }
    ]
  },
  {
    id: '2',
    category: 'processes',
    text: 'How automated are your business processes?',
    options: [
      { id: '2a', text: 'Mostly manual processes', value: 0 },
      { id: '2b', text: 'Some basic automation tools', value: 1 },
      { id: '2c', text: 'Significant automation in place', value: 2 },
      { id: '2d', text: 'Fully automated core processes', value: 3 }
    ]
  }
];

export default function AssessmentPage() {
  const t = useTranslations();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({...prev, [questionId]: optionId}));
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <PageWrapper>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            {t('assessment.title')}
          </h1>
          <div className="text-right">
            <div className="text-sm text-gray-400">
              {t('assessment.progress')}
            </div>
            <div className="text-2xl font-bold">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-800 h-2">
          <div 
            className="bg-orange-500 h-2 transition-all duration-300"
            style={{width: `${progress}%`}}
          />
        </div>

        {currentQuestion && (
          <Card animate>
            <CardHeader>
              <div className="text-sm text-orange-500 uppercase tracking-wider mb-2">
                {currentQuestion.category}
              </div>
              <CardTitle>{currentQuestion.text}</CardTitle>
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