import { redirect } from 'next/navigation';
import { type NextPage } from 'next';
import { type PageProps } from '../page';

const AssessmentRoot: NextPage<PageProps> = async ({ params }) => {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  redirect(`/${locale}/home`);
};

export default AssessmentRoot; 