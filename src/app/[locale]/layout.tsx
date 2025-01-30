import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { AssessmentProvider } from '@/context/AssessmentContext';
import { unstable_setRequestLocale } from 'next-intl/server';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Enable static rendering
  unstable_setRequestLocale(locale);
  
  const messages = await getMessages();

  return (
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
  );
} 
