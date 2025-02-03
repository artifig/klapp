import { redirect } from '@/i18n/navigation';

// Redirect from / to /defaultLocale/home
export default async function RootPage() {
  // Use next-intl navigation for consistent locale handling
  redirect('/home');
}
