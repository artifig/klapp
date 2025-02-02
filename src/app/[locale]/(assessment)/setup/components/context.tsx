'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAssessmentState } from '@/state/AssessmentState';
import ClientOnly from '@/components/ClientOnly';

interface RequirementItemProps {
  label: string;
  isComplete: boolean;
}

const RequirementItem = ({ label, isComplete }: RequirementItemProps) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-700">{label}</span>
    <span className={`${isComplete ? 'text-green-500' : 'text-gray-400'}`}>
      {isComplete ? '✓' : '○'}
    </span>
  </div>
);

export const Context = () => {
  const t = useTranslations('setup');
  const { goal, formData } = useAssessmentState();

  const requirements = [
    { key: 'name', value: formData.name },
    { key: 'email', value: formData.email },
    { key: 'companyName', value: formData.companyName },
    { key: 'companyType', value: formData.companyType },
  ];

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t('contextCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <CardDescription className="font-medium mb-2">
                {t('contextCard.requirements')}
              </CardDescription>
              <div className="divide-y">
                {requirements.map(({ key, value }) => (
                  <RequirementItem
                    key={key}
                    label={t(`${key}Label`)}
                    isComplete={!!value}
                  />
                ))}
              </div>
            </div>

            <div>
              <CardDescription className="font-medium mb-2">
                {t('contextCard.yourGoal')}
              </CardDescription>
              <p className="text-sm text-muted-foreground">{goal || t('goal.empty')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
}; 