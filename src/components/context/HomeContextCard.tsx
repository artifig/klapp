'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import ClientOnly from '@/components/ClientOnly';

export const HomeContextCard = () => {
  const t = useTranslations('home');

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('contextCard.title')}</CardTitle>
          <CardDescription>{t('contextCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {['step1', 'step2', 'step3', 'step4'].map((step) => (
              <li key={step}>{t(`contextCard.steps.${step}`)}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </ClientOnly>
  );
};

export default HomeContextCard; 