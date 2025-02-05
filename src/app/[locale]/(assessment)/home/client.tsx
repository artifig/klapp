'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/state/assessment-state';
import { useState, useEffect } from 'react';
import { createResponse } from '@/lib/airtable/mutations';
import { useSearchParams } from 'next/navigation';
import type { CompanyType } from '@/lib/airtable/types';
import { getLocalizedText } from '@/lib/utils';

interface Props {
  initialCompanyTypes: CompanyType[];
}

export function HomeClient({ initialCompanyTypes }: Props) {
  const t = useTranslations('home');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbedded = searchParams?.get('embedded') === 'true';
  const { dispatch } = useAssessment();
  const [goal, setLocalGoal] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when home page is mounted
  useEffect(() => {
    console.log('🏠 Home: Resetting entire state');
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || !companyType || isSubmitting) {
      setError(t('validation.required'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      console.log('🎯 Creating initial response with goal:', goal);
      const result = await createResponse({
        initialGoal: goal,
        companyType: companyType
      });
      console.log('📝 Create response result:', result);

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to create assessment');
        return;
      }

      // Set both goal and company type in state
      dispatch({
        type: 'SET_GOAL',
        payload: {
          goal,
          responseId: result.data.responseId,
          recordId: result.data.recordId
        }
      });

      dispatch({
        type: 'SET_SETUP_FORM',
        payload: {
          name: '',
          email: '',
          companyName: '',
          companyType
        }
      });

      router.push('/setup');
    } catch (error) {
      console.error('Error submitting goal:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-3xl mx-auto ${isEmbedded ? 'p-0' : 'p-4'}`}>
      <Card className={`w-full ${isEmbedded ? 'shadow-none border-0' : 'shadow-lg'}`}>
        <CardContent className="space-y-6 p-6">
          {/* Introduction */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('interactiveCard.title')}
            </h1>
            <p className="text-gray-600">
              {t('contextCard.description')}
            </p>
          </div>

          {/* What to Expect */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('whatToExpect')}
            </h2>
            <ul className="space-y-2">
              {['evaluation', 'areas', 'recommendations', 'insights'].map((key) => (
                <li key={key} className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 mt-1 mr-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-600">{t(`expectationsList.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Time Required */}
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('timeEstimate')}
          </div>

          {/* Goal Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="goal" className="block text-lg font-semibold text-gray-900">
                {t('form.goal')}
              </label>
              <p className="mt-1 text-sm text-gray-600">
                {t('form.goalDescription')}
              </p>
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setLocalGoal(e.target.value)}
                placeholder={t('form.goalPlaceholder')}
                required
                className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Company Type Selector */}
            <div>
              <label htmlFor="companyType" className="block text-lg font-semibold text-gray-900">
                {t('form.companyType')}
              </label>
              <p className="mt-1 text-sm text-gray-600">
                {t('form.companyTypeDescription')}
              </p>
              <select
                id="companyType"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                required
                className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                disabled={isSubmitting}
              >
                <option value="">{t('form.companyTypeSelect')}</option>
                {initialCompanyTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {getLocalizedText(type.text, 'et')}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 