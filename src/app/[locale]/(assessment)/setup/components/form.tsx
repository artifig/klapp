'use client';

import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import type { AirtableMethodCompanyType } from '@/lib/airtable';

interface FormProps {
  companyTypes: AirtableMethodCompanyType[];
  onSubmit: (data: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
}

export function Form({ companyTypes, onSubmit }: FormProps) {
  const t = useTranslations('Setup.form');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form fields here */}
    </form>
  );
} 