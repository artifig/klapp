'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';

export const HomeContextCard = () => {
  const t = useTranslations('home');

  return (
    <Card title={t('contextCard.title')}>
      <div className="space-y-4">
        <p className="text-gray-600">{t('contextCard.description')}</p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          {['step1', 'step2', 'step3', 'step4'].map((step) => (
            <li key={step}>{t(`contextCard.steps.${step}`)}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default HomeContextCard; 