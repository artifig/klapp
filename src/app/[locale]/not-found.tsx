import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-gray-600">{t('message')}</p>
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {t('backHome')}
      </Link>
    </div>
  );
} 