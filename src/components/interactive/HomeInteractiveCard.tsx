'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';

export const HomeInteractiveCard = () => {
  const t = useTranslations('home');
  const router = useRouter();
  const { setGoal } = useAssessmentContext();
  const [goalText, setGoalText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal(goalText);
    router.push('/setup');
  };

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="sr-only">Goal Setting</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="goal"
                className="block text-sm font-medium text-gray-700"
              >
                {t('form.goal')}
              </label>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('form.goalDescription')}
              </p>
              <textarea
                id="goal"
                name="goal"
                rows={4}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder={t('form.goalPlaceholder')}
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t('form.submit')}
            </button>
          </form>
        </CardContent>
      </Card>
    </ClientOnly>
  );
};

export default HomeInteractiveCard; 