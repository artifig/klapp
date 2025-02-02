'use client';

import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
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

export const SetupContextCard = () => {
  const t = useTranslations('setup');
  const { goal, formData } = useAssessmentContext();

  const requirements = [
    { key: 'name', value: formData?.name },
    { key: 'email', value: formData?.email },
    { key: 'companyName', value: formData?.companyName },
    { key: 'companyType', value: formData?.companyType },
  ];

  return (
    <ClientOnly>
      <Card title={t('contextCard.title')}>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {t('contextCard.requirements')}
            </h3>
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
            <h3 className="font-medium text-gray-900 mb-2">
              {t('contextCard.yourGoal')}
            </h3>
            <p className="text-gray-600">{goal || t('goal.empty')}</p>
          </div>
        </div>
      </Card>
    </ClientOnly>
  );
};

export default SetupContextCard; 