'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useEmailUpdateForm } from '@/state/AssessmentState';
import ClientOnly from '@/components/ClientOnly';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

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

export const Interactive = () => {
  const t = useTranslations('results');
  const { email, handleSubmit, setEmailUpdateForm, isSubmitting, error } = useEmailUpdateForm();
  const [isExporting, setIsExporting] = useState(false);
  const [matchedProviders] = useState<Provider[]>([]); // TODO: Get from API

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Implementation for PDF export
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsExporting(false);
    }
  };

  const handleContactProvider = (provider: Provider) => {
    // Implementation for contacting provider
    console.log('Contacting provider:', provider);
  };

  return (
    <ClientOnly>
      <Card>
        <CardHeader>
          <CardTitle>{t('emailResults')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Email Results Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <ErrorMessage message={error} />}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('form.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={email}
                  onChange={(e) => setEmailUpdateForm({ email: e.target.value })}
                  disabled={isSubmitting}
                  placeholder={t('form.emailPlaceholder')}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isSubmitting ? t('sending') : t('sendResults')}
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isExporting ? t('exporting') : t('exportPDF')}
                </button>
              </div>
            </form>

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
        </CardContent>
      </Card>
    </ClientOnly>
  );
};

export default Interactive; 