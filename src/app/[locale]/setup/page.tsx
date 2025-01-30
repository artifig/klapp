'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';
import {CompanyType} from '@/services/airtable';

export default function SetupPage() {
  const t = useTranslations();
  const {state, setFormData} = useAssessment();
  const [formData, setLocalFormData] = useState(state.formData);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    console.log('Input changed:', { name, value });
    const newFormData = {...formData, [name]: value};
    console.log('New form data:', newFormData);
    setLocalFormData(newFormData);
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: false}));
    }
    setFormData(newFormData);
  };

  const handleNext = (e: React.MouseEvent) => {
    console.log('Submitting form data:', formData);
    // Validate all required fields
    const newErrors: Record<string, boolean> = {};
    let hasErrors = false;

    if (!formData.name?.trim()) {
      newErrors.name = true;
      hasErrors = true;
    }
    if (!formData.company?.trim()) {
      newErrors.company = true;
      hasErrors = true;
    }
    if (!formData.email?.trim()) {
      newErrors.email = true;
      hasErrors = true;
    }
    if (!formData.companyType) {
      newErrors.companyType = true;
      hasErrors = true;
    }

    if (hasErrors) {
      console.log('Form validation failed:', newErrors);
      e.preventDefault();
      setErrors(newErrors);
      return;
    }

    console.log('Form validation passed, proceeding with:', formData);
    setFormData(formData);
  };

  return (
    <PageWrapper>
      <div className="h-full flex flex-col">
        <div className="flex-1 grid lg:grid-cols-2 gap-4">
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
                  className="w-full px-6 py-2 bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors text-center"
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
                <form className="space-y-6">
                  <div className="grid gap-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                        {t('setup.nameLabel')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-800/50 border text-white
                          focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors
                          ${errors.name ? 'border-red-500' : 'border-gray-700'}`}
                        required
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{t('common.required')}</p>
                      )}
                    </div>

                    {/* Company Input */}
                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300">
                        {t('setup.companyLabel')}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-800/50 border text-white
                          focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors
                          ${errors.company ? 'border-red-500' : 'border-gray-700'}`}
                        required
                      />
                      {errors.company && (
                        <p className="text-red-500 text-sm">{t('common.required')}</p>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        {t('setup.emailLabel')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-800/50 border text-white
                          focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors
                          ${errors.email ? 'border-red-500' : 'border-gray-700'}`}
                        required
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{t('common.required')}</p>
                      )}
                    </div>

                    {/* Company Type Select */}
                    <div className="space-y-2">
                      <label htmlFor="companyType" className="block text-sm font-medium text-gray-300">
                        {t('setup.companyType.label')}
                      </label>
                      <select
                        id="companyType"
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-800/50 border text-white
                          focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors
                          ${errors.companyType ? 'border-red-500' : 'border-gray-700'}`}
                        required
                      >
                        <option value="">{t('setup.companyType.label')}</option>
                        <option value="startup">{t('setup.companyType.startup')}</option>
                        <option value="sme">{t('setup.companyType.sme')}</option>
                        <option value="corporation">{t('setup.companyType.corporation')}</option>
                      </select>
                      {errors.companyType && (
                        <p className="text-red-500 text-sm">{t('common.required')}</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              <div className="mt-6">
                <Link
                  href={routes.assessment}
                  onClick={handleNext}
                  className="primary-button block w-full text-center"
                >
                  {t('setup.continue')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
} 
