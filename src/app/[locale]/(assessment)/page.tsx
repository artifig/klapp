import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  redirect(`/${locale}/home`);
} 