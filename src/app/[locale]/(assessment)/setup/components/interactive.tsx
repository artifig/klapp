'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useSetupForm } from '@/state/AssessmentState';
import ClientOnly from '@/components/ClientOnly';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AirtableMethodCompanyType } from '@/lib/airtable';

interface SetupInteractiveCardProps {
  initialCompanyTypes: AirtableMethodCompanyType[];
}

export const Interactive = ({ initialCompanyTypes }: SetupInteractiveCardProps) => {
  const t = useTranslations('setup');
  const { formData, handleSubmit, setSetupForm, isSubmitting, error } = useSetupForm();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSetupForm({ ...formData, [name]: value });
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
          <CardTitle>{t('title')}</CardTitle>
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
                value={formData.name}
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
                value={formData.email}
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
                value={formData.companyName}
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
                value={formData.companyType}
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