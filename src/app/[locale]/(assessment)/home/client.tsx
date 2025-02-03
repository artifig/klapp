'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function HomeClient() {
  const t = useTranslations('home');
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('interactiveCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{t('interactiveCard.description')}</p>
          <Button onClick={() => router.push('/setup')} className="w-full">
            {t('interactiveCard.startButton')}
          </Button>
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