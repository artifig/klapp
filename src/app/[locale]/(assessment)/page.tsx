import { redirect } from 'next/navigation';
import { type NextPage } from 'next';
import { type PageProps } from '../page';

const AssessmentRoot: NextPage<PageProps> = async props => {
  const params = await props.params;
  const { locale } = params;
  redirect(`/${locale}/home`);
};

export default AssessmentRoot; 