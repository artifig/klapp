'use client';

import {useTranslations} from 'next-intl';
import {Link, routes, useRouter} from '@/navigation';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';
import useOfflineStatus from '@/hooks/useOfflineStatus';

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const isOffline = useOfflineStatus();
  const {state, setGoal} = useAssessment();
  const [error, setError] = useState<string | null>(null);
  const maxCharacters = 500; // Maximum characters allowed

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxCharacters) {
      setGoal(value);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!state.goal?.trim()) {
        setError(t('errors.goalRequired'));
        return;
      }

      router.push(routes.setup);
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
                          setGoal(example);
                        }}
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goal Input */}
                <div className="flex-1 space-y-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                      value={state.goal}
                      onChange={handleChange}
                      placeholder={t('home.goalPlaceholder')}
                      className="w-full min-h-[150px] p-3 bg-gray-800/50 border border-gray-700 
                        rounded-lg focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                      maxLength={maxCharacters}
                    />
                    <div className="text-sm text-gray-400 flex justify-between">
                      <span>{state.goal?.length || 0}/{maxCharacters}</span>
                      {isOffline && (
                        <span className="text-yellow-500">
                          {t('common.offlineMode')}
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 
                    text-white font-medium rounded-lg transition-colors"
                >
                  {t('common.continue')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
} 
