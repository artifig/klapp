'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/state';
import { useState, useEffect } from 'react';
import { createInitialResponse } from '@/lib/actions';

export function HomeClient() {
  const t = useTranslations('home');
  const router = useRouter();
  const { setGoal, resetState } = useAssessment();
  const [goal, setLocalGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when component mounts
  useEffect(() => {
    resetState();
  }, [resetState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createInitialResponse(goal);
      if (!result.success) {
        setError(result.error || 'Failed to create assessment');
        return;
      }

      setGoal({ goal, responseId: result.responseId });
      router.push('/setup');
    } catch (error) {
      console.error('Error submitting goal:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('form.submitting') : t('form.submit')}
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