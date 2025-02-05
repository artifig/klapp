import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

export async function getMessages(locale: string) {
  try {
    return (await import(`./locales/${locale}.json`)).default;
  } catch {
    notFound();
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: await getMessages(locale),
    timeZone: 'Europe/Tallinn'
  };
}); 