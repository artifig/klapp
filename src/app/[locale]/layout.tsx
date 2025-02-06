import { getMessages } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SettingsButtons } from '@/components/settings-buttons';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params: localeParam
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const resolvedParams = await localeParam;
  const locale = resolvedParams.locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'app' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  unstable_setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-background text-foreground relative">
        <LoadingScreen />
        <div className="absolute top-4 right-4 z-50">
          <SettingsButtons />
        </div>
        <main>
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
} 
