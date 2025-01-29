import {redirect} from 'next/navigation';
import {defaultLocale} from '@/config';

// Redirect from / to /et
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
