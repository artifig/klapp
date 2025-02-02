'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useAssessment } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';

export const HomeInteractiveCard = () => {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const { setGoal } = useAssessment();
  const [goalText, setGoalText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal(goalText);
    router.push(`/${locale}/setup`);
  };

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('form.goal')}</CardTitle>
          <CardDescription>{t('form.goalDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
            <textarea
              id="goal"
              name="goal"
              rows={4}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder={t('form.goalPlaceholder')}
            />
          </form>
        </CardContent>
        <CardFooter>
          <button
            type="submit"
            form="goal-form"
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {t('form.submit')}
          </button>
        </CardFooter>
      </Card>
    </ClientOnly>
  );
};

export default HomeInteractiveCard; 