import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {ReactNode} from 'react';
import {locales} from '@/config';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {Navbar} from '@/components/ui/Navbar';
import {getMessages} from '@/i18n';
import {AssessmentProvider} from '@/context/AssessmentContext';

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const {locale} = await params;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-black text-white min-h-screen antialiased font-[Arial]">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AssessmentProvider>
            <LanguageSwitcher />
            <Navbar />
            <main className="pt-4">
              {children}
            </main>
          </AssessmentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
