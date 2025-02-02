'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useGoalForm } from '@/state/AssessmentState';

export const Interactive = () => {
  const t = useTranslations('home');
  const { goal, handleSubmit, setGoalForm } = useGoalForm();

  return (
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
            value={goal || ''}
            onChange={(e) => setGoalForm({ goal: e.target.value })}
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
  );
}; 