import { redirect } from 'next/navigation';

interface AssessmentRootProps {
  params: {
    locale: string;
  };
}

export default function AssessmentRoot({ params: { locale } }: AssessmentRootProps) {
  redirect(`/${locale}/home`);
} 