import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {ReactNode} from 'react';
import {locales} from '@/config';
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
      <body className="bg-black text-white min-h-screen antialiased font-[Arial] relative">
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black">
          <div 
            className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] 
              bg-orange-500/20 rounded-full blur-3xl opacity-20 pointer-events-none"
          />
        </div>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AssessmentProvider>
            <div className="relative flex flex-col min-h-screen">
              <header className="sticky top-0 z-50">
                <Navbar />
              </header>
              <main className="flex-1 container mx-auto px-4 py-6">
                {children}
              </main>
              <footer className="relative h-16 mt-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              </footer>
            </div>
          </AssessmentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
