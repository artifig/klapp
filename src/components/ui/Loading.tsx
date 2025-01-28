'use client';

import {useTranslations} from 'next-intl';

export function Loading() {
  const t = useTranslations('common');

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">{t('loading')}</p>
      </div>
    </div>
  );
} 