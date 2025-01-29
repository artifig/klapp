'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState, useEffect} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';

export default function Home() {
  const t = useTranslations();
  const {state, setGoal} = useAssessment();
  const [goal, setLocalGoal] = useState(state.goal);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setLocalGoal(state.goal);
  }, [state.goal]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalGoal(value);
    if (showError) setShowError(false);
    setGoal(value);
  };

  const handleNext = (e: React.MouseEvent) => {
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
                  <h3 className="font-semibold text-lg mb-2">What to Expect</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Comprehensive evaluation of your organization's AI readiness</li>
                    <li>• Assessment across 22 key business areas</li>
                    <li>• Personalized recommendations based on your responses</li>
                    <li>• Actionable insights for improvement</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Time Required</h3>
                  <p className="text-gray-300">The assessment typically takes 10-15 minutes to complete.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Goal Setting */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>{t('home.goalLabel')}</CardTitle>
              <CardDescription>
                {t('home.goalPlaceholder')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <textarea
                  id="goal"
                  value={goal}
                  onChange={handleChange}
                  className={`w-full h-full p-4 bg-gray-800/50 border rounded-none text-white resize-none
                    focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors
                    ${showError ? 'border-red-500' : 'border-gray-700'}`}
                  placeholder={t('home.goalPlaceholder')}
                />
                {showError && (
                  <p className="text-red-500 text-sm mt-2">
                    {t('common.required')}
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Link
                  href={routes.setup}
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                    shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
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
