import { redirect } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';

// Redirect from / to /defaultLocale/home
export default async function RootPage() {
  setRequestLocale('et'); // Set default locale for static rendering
  redirect('/home');
}
