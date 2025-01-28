'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';

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
    <main className="container mx-auto px-4 py-8 max-w-4xl">
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

        <div className="w-full bg-gray-700 h-2">
          <div 
            className="bg-orange-500 h-2 transition-all duration-300"
            style={{width: `${progress}%`}}
          />
        </div>

        {currentQuestion && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-sm text-orange-500 uppercase tracking-wider">
                {currentQuestion.category}
              </div>
              <h2 className="text-2xl">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(currentQuestion.id, option.id)}
                  className={`w-full p-4 text-left border transition-colors ${
                    answers[currentQuestion.id] === option.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('assessment.previousQuestion')}
          </button>
          
          {isComplete && (
            <Link
              href={routes.results}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
            >
              {t('assessment.complete')}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
} 