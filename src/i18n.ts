import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale, type Locale} from './config';

export async function getMessages(locale: string) {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
}

export default getRequestConfig(async ({requestLocale}) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: await getMessages(locale),
    timeZone: 'Europe/Tallinn'
  };
}); 