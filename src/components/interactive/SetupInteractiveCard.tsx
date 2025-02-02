'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';
import { getCompanyTypesMetadata, CompanyTypeMetadata, getDataForCompanyType } from '@/lib/airtable';
import { Loading } from '@/components/ui/Loading';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface FormData {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
}

export const SetupInteractiveCard = () => {
  const t = useTranslations('setup');
  const router = useRouter();
  const { setFormData } = useAssessmentContext();
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);
  const [localFormData, setLocalFormData] = useState<FormData>({
    name: '',
    email: '',
    companyName: '',
    companyType: '',
  });
  const [companyTypes, setCompanyTypes] = useState<CompanyTypeMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch company types metadata on component mount
  useEffect(() => {
    const fetchCompanyTypes = async () => {
      if (initializedRef.current || fetchingRef.current) return;
      initializedRef.current = true;
      fetchingRef.current = true;

      try {
        setIsLoading(true);
        const metadata = await getCompanyTypesMetadata();
        console.log('📊 Company types:', metadata.map(m => ({
          name: `${m.companyTypeText_et} / ${m.companyTypeText_en}`
        })));
        setCompanyTypes(metadata);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching company types:', err);
        setError(t('errors.fetchingCompanyTypes'));
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchCompanyTypes();
  }, [t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }

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

  if (isLoading) {
    return (
      <ClientOnly>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="sr-only">Setup Form</CardTitle>
          </CardHeader>
          <CardContent>
            <Loading type="card" />
          </CardContent>
        </Card>
      </ClientOnly>
    );
  }

  if (error) {
    return (
      <ClientOnly>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="sr-only">Error</CardTitle>
          </CardHeader>
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
          <CardTitle className="sr-only">Setup Form</CardTitle>
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
              >
                <option value="">{t('form.selectCompanyType')}</option>
                {companyTypes.map((type) => (
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

export default SetupInteractiveCard; 