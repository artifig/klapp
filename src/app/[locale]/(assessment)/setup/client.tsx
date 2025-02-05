'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CompanyType, LocalizedText } from '@/lib/airtable/types';
import { useAssessment } from '@/state';
import { useState, useEffect } from 'react';
import { updateCompanyDetails } from '@/lib/airtable/mutations';

interface Props {
  initialCompanyTypes: CompanyType[];
}

interface FormErrors {
  name?: string;
  email?: string;
  companyName?: string;
  companyType?: string;
}

const getLocalizedText = (text: LocalizedText, locale: string): string => {
  return text[locale as keyof LocalizedText] || '';
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function Client({ initialCompanyTypes }: Props) {
  const t = useTranslations('setup');
  const locale = useLocale();
  const router = useRouter();
  const { forms: { goal }, setSetupForm } = useAssessment();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companyType: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect if no goal is set
  useEffect(() => {
    if (!goal.responseId) {
      router.push('/');
    }
  }, [goal.responseId, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.name.required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('validation.name.tooShort');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.email.required');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('validation.email.invalid');
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = t('validation.company.required');
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = t('validation.company.tooShort');
    }

    if (!formData.companyType) {
      newErrors.companyType = t('validation.companyType.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!goal.responseId || !goal.recordId) {
        throw new Error('No response ID found');
      }

      const result = await updateCompanyDetails(goal.recordId, {
        contactName: formData.name,
        contactEmail: formData.email,
        companyName: formData.companyName,
        companyType: formData.companyType
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update company details');
      }

      setSetupForm(formData);
      router.push('/assessment');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!goal.responseId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="w-full">
        <CardContent className="space-y-6 p-6">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('title')}
            </h1>
            <p className="text-gray-600">
              {t('contextCard.description')}
            </p>
          </div>

          {/* Current Goal */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-medium text-gray-900">
              {t('goal.title')}
            </h2>
            <p className="mt-1 text-gray-600">
              {goal.goal || t('goal.empty')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.nameLabel')}
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                required
                className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.name ? 'border-red-500' : ''
                  }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                required
                className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.email ? 'border-red-500' : ''
                  }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.companyNameLabel')}
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => {
                  setFormData({ ...formData, companyName: e.target.value });
                  if (errors.companyName) setErrors({ ...errors, companyName: undefined });
                }}
                required
                className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.companyName ? 'border-red-500' : ''
                  }`}
                disabled={isSubmitting}
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.companyTypeLabel')}
              </label>
              <select
                id="companyType"
                value={formData.companyType}
                onChange={(e) => {
                  setFormData({ ...formData, companyType: e.target.value });
                  if (errors.companyType) setErrors({ ...errors, companyType: undefined });
                }}
                required
                className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.companyType ? 'border-red-500' : ''
                  }`}
                disabled={isSubmitting}
              >
                <option value="">{t('interactiveCard.companyTypeSelect')}</option>
                {initialCompanyTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {getLocalizedText(type.text, locale)}
                  </option>
                ))}
              </select>
              {errors.companyType && (
                <p className="mt-1 text-sm text-red-500">{errors.companyType}</p>
              )}
            </div>

            {submitError && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                {submitError}
              </div>
            )}

            {/* Next Steps List */}
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                {t('nextStepsList.required')}
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                {t('nextStepsList.confidential')}
              </li>
            </ul>

            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('form.submitting') : t('interactiveCard.submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 