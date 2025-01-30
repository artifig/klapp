import { ReactNode } from 'react';

interface PageLayoutProps {
  contextCard: ReactNode;
  interactiveCard: ReactNode;
}

export const PageLayout = ({ contextCard, interactiveCard }: PageLayoutProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Context Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {contextCard}
        </div>

        {/* Interactive Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {interactiveCard}
        </div>
      </div>
    </div>
  );
};

export default PageLayout; 