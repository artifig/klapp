import { AssessmentProvider } from '@/state/AssessmentState';

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AssessmentProvider>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </AssessmentProvider>
  );
} 