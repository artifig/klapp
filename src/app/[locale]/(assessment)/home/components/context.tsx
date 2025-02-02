'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import ClientOnly from '@/components/ClientOnly';

export const Context = () => {
  const t = useTranslations('home');

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('contextCard.title')}</CardTitle>
          <CardDescription>{t('contextCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t('whatToExpect')}</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              {Object.keys(t.raw('expectationsList')).map((key) => (
                <li key={key}>{t(`expectationsList.${key}`)}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t('timeRequired')}</h4>
            <p className="text-sm text-muted-foreground">{t('timeEstimate')}</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t('stepsTitle')}</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              {['step1', 'step2', 'step3', 'step4'].map((step) => (
                <li key={step}>{t(`contextCard.steps.${step}`)}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
}; 