'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">{t('title')}</h2>
        <ErrorMessage message={t('message')} />
      </div>
      <Button
        onClick={reset}
        variant="secondary"
      >
        {t('tryAgain')}
      </Button>
    </div>
  );
} 