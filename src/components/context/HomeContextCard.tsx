'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import ClientOnly from '@/components/ClientOnly';

export const HomeContextCard = () => {
  const t = useTranslations('home');

  return (
    <ClientOnly>
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {t('contextCard.title')}
            </h3>
            <p className="text-gray-600">
              {t('contextCard.description')}
            </p>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {['step1', 'step2', 'step3', 'step4'].map((step) => (
              <li key={step}>{t(`contextCard.steps.${step}`)}</li>
            ))}
          </ul>
        </div>
      </Card>
    </ClientOnly>
  );
};

export default HomeContextCard; 