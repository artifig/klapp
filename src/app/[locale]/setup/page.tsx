'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState, useEffect} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';
import {CompanyType} from '@/services/airtable';
import {Building2, Rocket, Building} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useSync } from '@/lib/sync';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  email: string;
  company: string;
  companyType: string;
}

type FormField = keyof FormData;

export default function SetupPage() {
  const t = useTranslations();
  const {state, setFormData} = useAssessment();
  const [error, setError] = useState<string | null>(null);

  // Use sync hook for form data
  const {
    data: formData = state.formData as FormData,
    updateData: setLocalFormData,
    isOffline,
    syncStatus,
    syncData
  } = useSync<FormData>({
    key: 'setup_form_data',
    initialData: state.formData as FormData,
    onSync: async (data) => {
      // Only sync if we have all required fields
      if (data.name?.trim() && 
          data.email?.trim() && 
          data.company?.trim() && 
          data.companyType) {
        // Replace with your actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFormData(data);
      }
    }
  });

  // Validation rules
  const validateField = (name: FormField, value: string | undefined) => {
    if (!value?.trim()) {
      return t(`setup.validation.${name}.required`);
    }

    switch (name) {
      case 'name':
        if (value.trim().length < 2) return t('setup.validation.name.tooShort');
        break;
      case 'company':
        if (value.trim().length < 2) return t('setup.validation.company.tooShort');
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('setup.validation.email.invalid');
        break;
    }
    return '';
  };

  // Auto-save functionality
  const debouncedSave = debounce(async (data: Partial<FormData>) => {
    try {
      setError(null);
      if (Object.keys(data).length === 4) {
        setLocalFormData(data as FormData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form data');
    }
  }, 1000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as FormField;
    const value = e.target.value;
    const newFormData = {...formData, [name]: value};
    setLocalFormData(newFormData);
    
    // Validate field
    const error = validateField(name, value);
    setError(error);
    
    // Trigger auto-save
    debouncedSave(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate all fields
      const validationErrors = Object.entries(formData).reduce<string[]>((errors, [field, value]) => {
        const error = validateField(field as keyof FormData, value);
        if (error) errors.push(error);
        return errors;
      }, []);

      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Update local data and wait for sync to complete
      await setLocalFormData(formData);
      await syncData();
      
      // Navigate to assessment
      window.location.href = routes.assessment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form data');
    }
  };

  const companyTypes = [
    { id: 'startup', icon: Rocket, color: 'orange' },
    { id: 'sme', icon: Building2, color: 'blue' },
    { id: 'corporation', icon: Building, color: 'purple' }
  ];

  // Add this function after the state declarations
  const isFormComplete = () => {
    return (
      formData.name?.trim() &&
      formData.email?.trim() &&
      formData.company?.trim() &&
      formData.companyType &&
      !error
    );
  };

  return (
    <PageWrapper>
      <div className="h-full flex flex-col">
        <div className="flex-1 grid lg:grid-cols-2 gap-4 p-4">
          {/* Left Column - Information */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-4xl">{t('setup.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('app.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('setup.yourGoal')}</h3>
                  <p className="text-gray-300 bg-gray-800/50 p-4 border border-gray-700">
                    {state.goal}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('setup.nextSteps')}</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• {t('setup.nextStepsList.details')}</li>
                    <li>• {t('setup.nextStepsList.required')}</li>
                    <li>• {t('setup.nextStepsList.confidential')}</li>
                    <li>• {t('setup.nextStepsList.proceed')}</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <Link
                  href={routes.home}
                  className="secondary-button block w-full text-center"
                >
                  {t('nav.back')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Setup Form */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>{t('setup.organizationDetails')}</CardTitle>
              <CardDescription>
                {t('setup.organizationInfo')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {/* Error Message */}
                {error && (
                  <ErrorMessage 
                    message={error}
                    className="mb-4 animate-shake"
                  />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information Group */}
                  <div className="space-y-4">
                    <div className="relative">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        {t('setup.nameLabel')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`input-field ${error ? 'error' : ''}`}
                          required
                        />
                        <div className="h-6 mt-1">
                          {error && (
                            <p className="text-red-500 text-sm absolute">{error}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        {t('setup.emailLabel')}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`input-field ${error ? 'error' : ''}`}
                          required
                        />
                        <div className="h-6 mt-1">
                          {error && (
                            <p className="text-red-500 text-sm absolute">{error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Information Group */}
                  <div className="space-y-4">
                    <div className="relative">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                        {t('setup.companyLabel')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className={`input-field ${error ? 'error' : ''}`}
                          required
                        />
                        <div className="h-6 mt-1">
                          {error && (
                            <p className="text-red-500 text-sm absolute">{error}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Type Radio Buttons */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {t('setup.companyType.label')}
                      </label>
                      <div className="grid gap-3">
                        {companyTypes.map(({id, icon: Icon, color}) => (
                          <label
                            key={id}
                            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all
                              ${formData.companyType === id 
                                ? 'border-orange-500 bg-orange-500/10' 
                                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'}`}
                          >
                            <input
                              type="radio"
                              name="companyType"
                              value={id}
                              checked={formData.companyType === id}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div className="flex-1 flex items-start gap-3">
                              <div className={`p-2 rounded-md bg-${color}-500/20 text-${color}-500`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-white">
                                  {t(`setup.companyType.${id}`)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {t(`setup.companyType.descriptions.${id}`)}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button - Moved inside form */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={!isFormComplete()}
                      className={cn(
                        "w-full text-center text-lg py-4 rounded-lg transition-all duration-200",
                        isFormComplete()
                          ? "primary-button hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {t('setup.continue')}
                    </button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
} 
