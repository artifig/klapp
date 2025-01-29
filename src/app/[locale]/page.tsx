'use client';

import {useTranslations} from 'next-intl';
import {Link, routes, useRouter} from '@/navigation';
import {useState, useEffect} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const {state, setGoal} = useAssessment();
  const [goal, setLocalGoal] = useState(state.goal);
  const [showError, setShowError] = useState(false);

  // Update local state when global state changes
  useEffect(() => {
    setLocalGoal(state.goal);
  }, [state.goal]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalGoal(value);
    if (showError) setShowError(false);
    // Update global state as user types
    setGoal(value);
  };

  return (
    <PageWrapper>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Page Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            {t('app.title')}
          </h1>
          <p className="text-gray-400">
            {t('app.description')}
          </p>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('home.goalLabel')}</CardTitle>
            <CardDescription>
              {t('home.goalPlaceholder')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <textarea
                id="goal"
                value={goal}
                onChange={handleChange}
                className={`w-full p-4 bg-gray-800/50 border rounded-none text-white min-h-[100px]
                  focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors
                  ${showError ? 'border-red-500' : 'border-gray-700'}`}
                placeholder={t('home.goalPlaceholder')}
              />
              {showError && (
                <p className="text-red-500 text-sm">
                  {t('common.required')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
} 
