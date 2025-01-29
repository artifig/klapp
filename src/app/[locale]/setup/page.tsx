'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';

export default function SetupPage() {
  const t = useTranslations();
  const {state, setFormData} = useAssessment();
  const [formData, setLocalFormData] = useState(state.formData);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    const newFormData = {...formData, [name]: value};
    setLocalFormData(newFormData);
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: false}));
    }
    setFormData(newFormData);
  };

  return (
    <PageWrapper>
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            {t('setup.title')}
          </h1>
          <p className="text-gray-400">
            {t('app.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Column - Information */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Assessment Goal</CardTitle>
              <CardDescription>
                Review your goal and understand the next steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Your Goal</h3>
                <p className="text-gray-300 bg-gray-800/50 p-4 border border-gray-700 min-h-[100px]">
                  {state.goal}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Next Steps</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Fill in your organization details</li>
                  <li>• All fields are required for accurate assessment</li>
                  <li>• Your data is kept confidential</li>
                  <li>• Proceed to assessment questions when ready</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Setup Form */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t('setup.title')}</CardTitle>
              <CardDescription>
                {t('app.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
} 
