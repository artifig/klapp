'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';

interface FormData {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
}

const COMPANY_TYPES = ['startup', 'scaleup', 'sme', 'enterprise'] as const;

export const SetupInteractiveCard = () => {
  const t = useTranslations('setup');
  const router = useRouter();
  const { setFormData } = useAssessmentContext();
  const [formData, setLocalFormData] = useState<FormData>({
    name: '',
    email: '',
    companyName: '',
    companyType: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(formData);
    router.push('/assessment');
  };

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
              value={formData.name}
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
              value={formData.email}
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
              value={formData.companyName}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={formData.companyType}
              onChange={handleChange}
            >
              <option value="">{t('form.selectCompanyType')}</option>
              {COMPANY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`companyTypes.${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t('form.submit')}
            </button>
          </div>
        </form>
      </Card>
    </ClientOnly>
  );
};

export default SetupInteractiveCard; 