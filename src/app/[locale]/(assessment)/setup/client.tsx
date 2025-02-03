'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AirtableMethodCompanyType } from '@/lib/airtable';
import { useAssessment } from '@/state/AssessmentState';
import { ChangeEvent } from 'react';

interface SetupClientProps {
  initialCompanyTypes: AirtableMethodCompanyType[];
}

export function SetupClient({ initialCompanyTypes }: SetupClientProps) {
  const t = useTranslations('setup');
  const router = useRouter();
  const { forms, setFormData } = useAssessment();
  const { setup: formData } = forms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(formData);
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, companyName: e.target.value })}
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
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, companyType: e.target.value })}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">{t('interactiveCard.companyTypePlaceholder')}</option>
                {initialCompanyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.companyTypeText_et}
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