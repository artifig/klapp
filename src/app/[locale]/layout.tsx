import { getMessages } from 'next-intl/server';
import { Logo } from '@/components/ui/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

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
  // Await the params object before destructuring
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  // Enable static rendering
  unstable_setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-gray-50">
        <LoadingScreen />
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Logo />
                </div>
              </div>
              <div className="flex items-center">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>
        <main className="py-8">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
} 
