'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/navigation';

export default function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'et' ? 'en' : 'et';
    router.replace(pathname, {locale: newLocale});
  };

  return (
    <button
      onClick={switchLocale}
      className="fixed top-4 right-4 px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-700 transition-colors flex items-center gap-2"
      aria-label={t('languageSwitch')}
    >
      <span className="font-bold">{locale.toUpperCase()}</span>
      <span className="text-gray-400">→</span>
      <span className="text-gray-400">{locale === 'et' ? 'EN' : 'ET'}</span>
    </button>
  );
} 
