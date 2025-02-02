'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAssessmentState } from '@/state/AssessmentState';
import ClientOnly from '@/components/ClientOnly';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AirtableMethodCompanyType } from '@/lib/airtable';

interface SetupInteractiveCardProps {
  initialCompanyTypes: AirtableMethodCompanyType[];
}

export const SetupInteractiveCard = ({ initialCompanyTypes }: SetupInteractiveCardProps) => {
  const t = useTranslations('setup');
  const router = useRouter();
  const { setFormData } = useAssessmentState();
  
  const [localFormData, setLocalFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companyType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setFormData(localFormData);
      router.push('/assessment');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(t('errors.submission'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <ClientOnly>
        <Card className="w-full">
          <CardContent>
            <ErrorMessage message={error} />
          </CardContent>
        </Card>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('form.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t('form.name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={localFormData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Email Input */}
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
                value={localFormData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Company Name Input */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700"
              >
                {t('form.companyName')}
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={localFormData.companyName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Company Type Select */}
            <div>
              <label
                htmlFor="companyType"
                className="block text-sm font-medium text-gray-700"
              >
                {t('form.companyType')}
              </label>
              <select
                id="companyType"
                name="companyType"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:opacity-50"
                value={localFormData.companyType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">{t('form.selectCompanyType')}</option>
                {initialCompanyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.companyTypeText_et} / {type.companyTypeText_en}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isSubmitting ? t('loading.submitting') : t('form.submit')}
            </button>
          </form>
        </CardContent>
      </Card>
    </ClientOnly>
  );
}; 