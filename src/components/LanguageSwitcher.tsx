'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'et' ? 'en' : 'et';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={switchLocale}
      className="secondary-button !px-6 !py-4 !uppercase-none flex flex-col items-center justify-center"
      aria-label={t('languageSwitch')}
    >
      {/* Circle with current language */}
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1
        bg-gray-700 text-gray-400">
        {locale.toUpperCase()}
      </div>

      {/* Label showing target language */}
      <span className="text-xs font-medium text-center text-gray-400">
        {locale === 'et' ? 'EN' : 'ET'}
      </span>
    </button>
  );
} 
