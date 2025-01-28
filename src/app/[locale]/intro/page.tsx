'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';

export default function IntroPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    companyType: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">
          {t('intro.title')}
        </h1>

        <form className="space-y-6">
          <div className="space-y-4">
            <label htmlFor="name" className="block text-lg">
              {t('intro.nameLabel')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-none text-white"
              required
            />
          </div>

          <div className="space-y-4">
            <label htmlFor="company" className="block text-lg">
              {t('intro.companyLabel')}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-none text-white"
              required
            />
          </div>

          <div className="space-y-4">
            <label htmlFor="email" className="block text-lg">
              {t('intro.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-none text-white"
              required
            />
          </div>

          <div className="space-y-4">
            <label htmlFor="companyType" className="block text-lg">
              {t('intro.companyType.label')}
            </label>
            <select
              id="companyType"
              name="companyType"
              value={formData.companyType}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-none text-white"
              required
            >
              <option value="">{t('intro.companyType.label')}</option>
              <option value="startup">{t('intro.companyType.startup')}</option>
              <option value="sme">{t('intro.companyType.sme')}</option>
              <option value="corporation">{t('intro.companyType.corporation')}</option>
            </select>
          </div>

          <div className="flex justify-between pt-6">
            <Link
              href={routes.home}
              className="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"
            >
              {t('nav.back')}
            </Link>
            <Link
              href={routes.assessment}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
            >
              {t('intro.continue')}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
} 
