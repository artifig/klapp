'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/state/assessment-state';
import { useState, useEffect } from 'react';
import { createResponse } from '@/lib/airtable/mutations';
import { useSearchParams } from 'next/navigation';
import type { CompanyType } from '@/lib/airtable/types';
import { getLocalizedText } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { motion } from 'framer-motion';

interface Props {
  initialCompanyTypes: CompanyType[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form progress
  useEffect(() => {
    let progress = 0;
    if (goal.trim()) progress += 50;
    if (companyType) progress += 50;
    setFormProgress(progress);
  }, [goal, companyType]);

  // Reset state when home page is mounted
  useEffect(() => {
    console.log('🏠 Home: Resetting entire state');
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || !companyType || isSubmitting) {
      setError(t('form.validation.required'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createResponse({
        initialGoal: goal,
        companyType: companyType
      });

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to create assessment');
        return;
      }

      dispatch({
        type: 'SET_INITIAL_FORM',
        payload: {
          goal,
          companyType,
          responseId: result.data.responseId,
          recordId: result.data.recordId
        }
      });

      router.push('/assessment');
    } catch (error) {
      console.error('Error submitting goal:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] ${isEmbedded ? 'p-0' : 'p-4 sm:p-6'}`}>
      <motion.div
        className="w-full max-w-3xl mx-auto"
        initial="hidden"
        animate="show"
        variants={container}
      >
        {/* Header */}
        <motion.div className="space-y-1.5 text-center mb-4" variants={item}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight brand-gradient-text">
            {t('interactiveCard.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-primary max-w-2xl mx-auto">
            {t('contextCard.description')}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={item}>
          <Card className="backdrop-blur-sm bg-card/95 shadow-lg border border-border dark:border-border/20">
            <CardHeader className="space-y-1.5 py-3">
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                {t('whatToExpect')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('timeEstimate')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-3 max-h-[calc(100dvh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {/* What to Expect */}
              <motion.div
                className="grid gap-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {['evaluation', 'areas', 'recommendations', 'insights'].map((key) => (
                  <motion.div
                    key={key}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
                    variants={item}
                  >
                    <div className="shrink-0">
                      <svg
                        className="h-4 w-4 text-brand-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm leading-snug text-foreground">
                      {t(`expectationsList.${key}`)}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Assessment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="goal"
                    className="text-sm font-medium text-foreground"
                  >
                    {t('form.goal')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('form.goalDescription')}
                  </p>
                  <textarea
                    id="goal"
                    value={goal}
                    onChange={(e) => setLocalGoal(e.target.value)}
                    placeholder={t('form.goalPlaceholder')}
                    required
                    className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="companyType"
                    className="text-sm font-medium text-foreground"
                  >
                    {t('form.companyType')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('form.companyTypeDescription')}
                  </p>
                  <select
                    id="companyType"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 py-2">
                    <AlertDescription className="text-destructive text-xs">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('form.progress.title')}</span>
                    <span>{formProgress}%</span>
                  </div>
                  <Progress
                    value={formProgress}
                    className="h-1.5 bg-secondary"
                    indicatorClassName="bg-brand-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('form.progress.description')}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full brand-gradient hover:opacity-90 transition-opacity text-white font-medium h-9 text-sm"
                  disabled={isSubmitting || formProgress !== 100}
                  loading={isSubmitting}
                >
                  {isSubmitting ? t('form.submitting') : t('form.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 