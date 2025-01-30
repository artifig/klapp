'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';

interface Provider {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  contactEmail: string;
}

interface ProviderCardProps {
  provider: Provider;
  onContact: (provider: Provider) => void;
}

const ProviderCard = ({ provider, onContact }: ProviderCardProps) => (
  <div className="border rounded-lg p-4 space-y-4">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-lg font-medium text-gray-900">{provider.name}</h4>
        <p className="text-sm text-gray-500">{provider.description}</p>
      </div>
      <div className="bg-primary-50 text-primary px-2 py-1 rounded-full text-sm">
        {Math.round(provider.matchScore * 100)}% match
      </div>
    </div>
    <button
      onClick={() => onContact(provider)}
      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      Contact Provider
    </button>
  </div>
);

export const ResultsInteractiveCard = () => {
  const t = useTranslations('Results');
  const { formData, results, matchedProviders } = useAssessmentContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Implementation for PDF export
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailResults = async () => {
    if (!formData?.email) return;
    // Implementation for sending results via email
  };

  const handleContactProvider = (provider: Provider) => {
    // Implementation for contacting provider
    console.log('Contacting provider:', provider);
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Export Actions */}
        <div className="flex space-x-4">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isExporting ? t('exporting') : t('exportPDF')}
          </button>
          <button
            onClick={handleEmailResults}
            disabled={!formData?.email}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {t('emailResults')}
          </button>
        </div>

        {/* Matched Providers */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('matchedProviders')}
          </h3>
          <div className="space-y-4">
            {matchedProviders?.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onContact={handleContactProvider}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsInteractiveCard; 