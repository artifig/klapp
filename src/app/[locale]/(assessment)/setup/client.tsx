'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CompanyType, LocalizedText } from '@/lib/airtable/types';
import { useAssessment } from '@/state';
import { useState } from 'react';

interface Props {
  initialCompanyTypes: CompanyType[];
}

const getLocalizedText = (text: LocalizedText, locale: string): string => {
  return text[locale as keyof LocalizedText] || '';
};

export function Client({ initialCompanyTypes }: Props) {
  const t = useTranslations('setup');
  const locale = useLocale();
  const router = useRouter();
  const { setSetupForm } = useAssessment();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companyType: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupForm(formData);
    router.push('/assessment');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('interactiveCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.nameLabel')}
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.companyNameLabel')}
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">
                {t('interactiveCard.companyTypeLabel')}
              </label>
              <select
                id="companyType"
                value={formData.companyType}
                onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">{t('interactiveCard.companyTypeSelect')}</option>
                {initialCompanyTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {getLocalizedText(type.text, locale)}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full">
              {t('interactiveCard.submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('contextCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('contextCard.description')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 