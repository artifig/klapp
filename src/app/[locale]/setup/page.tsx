'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';

export default function SetupPage() {
  const t = useTranslations();
  const {state, setFormData} = useAssessment();
  const [formData, setLocalFormData] = useState(state.formData);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setLocalFormData(prev => ({...prev, [name]: value}));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: false}));
    }
  };

  const handleSubmit = (e: React.MouseEvent) => {
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
      e.preventDefault();
      setErrors(newErrors);
      return;
    }

    setFormData(formData);
  };

  return (
    <PageWrapper>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('setup.title')}</CardTitle>
            <CardDescription>
              {t('app.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link
              href={routes.home}
              className="px-6 py-2 bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
            >
              {t('nav.back')}
            </Link>
            <Link
              href={routes.assessment}
              onClick={handleSubmit}
              className="px-8 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
            >
              {t('setup.continue')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </PageWrapper>
  );
} 
