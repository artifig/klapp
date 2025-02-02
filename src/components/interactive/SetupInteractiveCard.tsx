'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
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
  const [isFetchingData, setIsFetchingData] = useState(false);

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
          name: `${m.companyTypeText_et} / ${m.companyTypeText_en}`,
          categories: m.categoryCount,
          questions: m.questionCount
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

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));

    // If company type changes, fetch the data and update counts
    if (name === 'companyType' && value) {
      setIsFetchingData(true);
      try {
        const data = await getDataForCompanyType(value);
        console.log('📊 Fetched data for company type:', {
          categoriesCount: data.categories.length,
          questionsCount: data.questions.length
        });

        // Update the company type metadata with actual counts
        setCompanyTypes(prevTypes => 
          prevTypes.map(type => {
            if (type.id === value) {
              return {
                ...type,
                categoryCount: data.categories.length,
                questionCount: data.questions.reduce((sum, q) => sum + q.answerId.length, 0)
              };
            }
            return type;
          })
        );
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('errors.fetchingData'));
      } finally {
        setIsFetchingData(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFetchingData) {
      return; // Don't proceed if still fetching data
    }

    try {
      setIsFetchingData(true);
      // Ensure we have the data for the selected company type
      if (localFormData.companyType) {
        await getDataForCompanyType(localFormData.companyType);
      }
      setFormData(localFormData);
      router.push('/assessment');
    } catch (err) {
      console.error('Error preparing assessment:', err);
      setError(t('errors.fetchingData'));
    } finally {
      setIsFetchingData(false);
    }
  };

  if (isLoading) {
    return (
      <ClientOnly>
        <Card>
          <Loading type="card" />
        </Card>
      </ClientOnly>
    );
  }

  if (error) {
    return (
      <ClientOnly>
        <Card>
          <ErrorMessage message={error} />
        </Card>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Card>
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
              disabled={isFetchingData}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:opacity-50"
              value={localFormData.companyType}
              onChange={handleChange}
            >
              <option value="">{t('form.selectCompanyType')}</option>
              {companyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.companyTypeText_et} / {type.companyTypeText_en} ({type.categoryCount} {t('categories')}, {type.questionCount} {t('questions')})
                </option>
              ))}
            </select>
            {isFetchingData && (
              <p className="mt-1 text-sm text-gray-500">{t('loading.fetchingData')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isFetchingData}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isFetchingData ? t('loading.preparingAssessment') : t('form.submit')}
          </button>
        </form>
      </Card>
    </ClientOnly>
  );
};

export default SetupInteractiveCard; 