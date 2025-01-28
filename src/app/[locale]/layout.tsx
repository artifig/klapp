import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {ReactNode} from 'react';
import {locales} from '@/config';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {getMessages} from '@/i18n';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

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
      <body className={`${inter.className} bg-black text-white min-h-screen antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LanguageSwitcher />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
