import { redirect } from 'next/navigation';

type Props = {
  params: {
    locale: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function AssessmentRoot({ params: { locale } }: Props) {
  redirect(`/${locale}/home`);
} 