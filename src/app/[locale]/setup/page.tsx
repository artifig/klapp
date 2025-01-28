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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setLocalFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = () => {
    setFormData(formData);
  };

  return (
    <PageWrapper>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t('setup.title')}
          </h1>
        </div>

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
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white
                      focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    required
                  />
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
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white
                      focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    required
                  />
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
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white
                    focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  required
                />
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
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white
                    focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  required
                >
                  <option value="">{t('setup.companyType.label')}</option>
                  <option value="startup">{t('setup.companyType.startup')}</option>
                  <option value="sme">{t('setup.companyType.sme')}</option>
                  <option value="corporation">{t('setup.companyType.corporation')}</option>
                </select>
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
