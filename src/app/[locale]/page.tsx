'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState, useEffect} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';
import {useSync} from '@/lib/sync';

export default function Home() {
  const t = useTranslations();
  const {state, setGoal} = useAssessment();
  const {
    data: goalData = state.goal || '',
    updateData: setLocalGoal,
    isOffline,
    syncStatus,
    syncData
  } = useSync<string>({
    key: 'goal',
    initialData: state.goal || '',
    onSync: async (data: string) => {
      if (data?.trim()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGoal(data);
      }
    }
  });
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxCharacters = 500; // Maximum characters allowed

  useEffect(() => {
    setLocalGoal(state.goal);
  }, [state.goal]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxCharacters) {
      setLocalGoal(value);
      if (showError) setShowError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!goalData?.trim()) {
        setError('Please enter your goal');
        return;
      }

      await setLocalGoal(goalData);
      await syncData();

      window.location.href = routes.setup;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    }
  };

  // Example goals
  const exampleGoals = [
    t('home.exampleGoals.goal1'),
    t('home.exampleGoals.goal2'),
    t('home.exampleGoals.goal3'),
  ];

  return (
    <PageWrapper>
      <div className="h-full flex flex-col">
        <div className="flex-1 grid lg:grid-cols-2 gap-4">
          {/* Left Column - Information */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-4xl">{t('app.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('app.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('home.whatToExpect')}</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• {t('home.expectationsList.evaluation')}</li>
                    <li>• {t('home.expectationsList.areas')}</li>
                    <li>• {t('home.expectationsList.recommendations')}</li>
                    <li>• {t('home.expectationsList.insights')}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('home.timeRequired')}</h3>
                  <p className="text-gray-300">{t('home.timeEstimate')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Goal Setting */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>{t('home.goalLabel')}</CardTitle>
              <CardDescription>
                {t('home.goalDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4">
                {/* Example Goals */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">{t('home.exampleGoalsTitle')}</h4>
                  <div className="grid gap-2">
                    {exampleGoals.map((example, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-800/50 border border-gray-700 rounded-md text-sm text-gray-300 cursor-pointer hover:border-orange-500/50 transition-colors"
                        onClick={() => {
                          setLocalGoal(example);
                        }}
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goal Input */}
                <div className="flex-1 space-y-2">
                  <textarea
                    id="goal"
                    value={goalData}
                    onChange={handleChange}
                    className={`w-full h-[200px] p-4 bg-gray-800/50 border rounded-md text-white resize-none
                      focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors
                      ${showError ? 'border-red-500' : 'border-gray-700'}`}
                    placeholder={t('home.goalPlaceholder')}
                  />
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      {showError && (
                        <p className="text-red-500">
                          {t('common.required')}
                        </p>
                      )}
                    </div>
                    <div className={`text-gray-400 ${(goalData.length || 0) > maxCharacters * 0.8 ? 'text-orange-500' : ''}`}>
                      {goalData.length || 0}/{maxCharacters}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <Link
                  href={routes.setup}
                  onClick={handleSubmit}
                  className="primary-button block w-full text-center text-lg py-4 shadow-xl
                    hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-200"
                >
                  {t('home.startButton')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
} 
