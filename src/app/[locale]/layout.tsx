import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {ReactNode} from 'react';
import {locales} from '@/config';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const inter = Inter({subsets: ['latin']});

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default function LocaleLayout({children, params: {locale}}: Props) {
  if (!locales.includes(locale as any)) notFound();

  const messages = useMessages();

  return (
    <html lang={locale} className={inter.className}>
      <body className="bg-black text-white min-h-screen">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LanguageSwitcher />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
