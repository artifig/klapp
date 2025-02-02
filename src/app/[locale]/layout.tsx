import { getMessages } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import ClientOnly from '@/components/ClientOnly';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  // Await the params object before destructuring
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  // Enable static rendering
  await unstable_setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientOnly type="full">
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="py-8">
                {children}
              </main>
            </div>
          </ClientOnly>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
