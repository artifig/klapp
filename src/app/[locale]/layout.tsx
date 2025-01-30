import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AssessmentProvider } from '@/context/AssessmentContext';

interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AssessmentProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="py-8">
                {children}
              </main>
            </div>
          </AssessmentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
