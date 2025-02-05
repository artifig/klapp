'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/state';
import { useState, useEffect } from 'react';

export function HomeClient() {
  const t = useTranslations('home');
  const router = useRouter();
  const { setGoal, resetState } = useAssessment();
  const [goal, setLocalGoal] = useState('');

  // Reset state when component mounts
  useEffect(() => {
    resetState();
  }, [resetState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setGoal(goal);
    router.push('/setup');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('form.goal')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                {t('form.goalDescription')}
              </label>
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setLocalGoal(e.target.value)}
                placeholder={t('form.goalPlaceholder')}
                required
                className="w-full p-2 border rounded mt-1"
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full">
              {t('form.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('contextCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('contextCard.description')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 