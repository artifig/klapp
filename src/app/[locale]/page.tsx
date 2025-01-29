'use client';

import {useTranslations} from 'next-intl';
import {Link, routes, useRouter} from '@/navigation';
import {useState, useEffect} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/Card';
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

  const handleSubmit = (e: React.MouseEvent) => {
    if (!goal.trim()) {
      e.preventDefault();
      setShowError(true);
      return;
    }
    setShowError(false);
    setGoal(goal);
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
                onChange={(e) => {
                  setLocalGoal(e.target.value);
                  if (showError) setShowError(false);
                }}
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
          <CardFooter className="flex justify-between">
            <div /> {/* Empty div for consistent spacing */}
            <Link
              href={routes.setup}
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
            >
              {t('home.startButton')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </PageWrapper>
  );
} 
