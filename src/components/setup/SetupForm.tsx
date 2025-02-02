import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { companyTypes } from '../../data/companyTypes';
import { routes } from '../../data/routes';

const SetupForm: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({});

  const { register, errors } = useForm();

  const handleSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Log the form submission
      console.log('📝 Submitting form:', {
        ...values,
        companyTypeId: companyTypes.find(ct => ct.id === values.companyType)?.companyTypeId
      });

      setFormData({
        ...values,
        // Ensure we're using the companyTypeId
        companyType: companyTypes.find(ct => ct.id === values.companyType)?.companyTypeId || values.companyType
      });

      router.push(`/${locale}${routes.assessment}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... other form fields ... */}
      
      <div>
        <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">
          {t('form.companyType')}
        </label>
        <select
          id="companyType"
          {...handleForm.register('companyType', { required: t('validation.companyType.required') })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${
            handleForm.formState.errors.companyType ? 'border-red-500' : ''
          }`}
        >
          <option value="">{t('form.selectCompanyType')}</option>
          {companyTypes.map((type) => (
            <option key={type.companyTypeId} value={type.companyTypeId}>
              {locale === 'et' ? type.companyTypeText_et : type.companyTypeText_en}
            </option>
          ))}
        </select>
        {/* ... error handling ... */}
      </div>
      
      {/* ... rest of the form ... */}
    </form>
  );
};

export default SetupForm; 