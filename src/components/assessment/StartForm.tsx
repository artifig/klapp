'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { type MethodCompanyType } from "@/lib/airtable";
import { createAssessment } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StartFormProps {
  companyTypes: MethodCompanyType[];
}

interface FormData {
  initialGoal: string;
  companyType: string;
}

export default function StartForm({ companyTypes }: StartFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ initialGoal: '', companyType: '' });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'initialGoal':
        if (!value.trim()) return 'Palun kirjeldage oma eesmärki';
        if (value.trim().length < 10) return 'Palun kirjeldage oma eesmärki põhjalikumalt';
        return '';
      case 'companyType':
        return !value ? 'Palun valige ettevõtte tüüp' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate all fields
    const errors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Palun täitke kõik väljad korrektselt');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createAssessment(formData);
      router.push(`/assessment/questions?id=${result.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Viga hindamise alustamisel. Palun proovige uuesti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = 500 - formData.initialGoal.length;

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-none">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="initialGoal" className="block text-sm font-medium">
            Mis on teie peamine äriline eesmärk seoses AI-ga? <Badge variant="primary">Nõutud</Badge>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Kirjeldage, mida soovite AI abil oma ettevõttes saavutada
          </p>
          <textarea
            id="initialGoal"
            name="initialGoal"
            value={formData.initialGoal}
            onChange={handleInputChange}
            rows={5}
            maxLength={500}
            className={`w-full p-3 border ${
              fieldErrors.initialGoal ? 'border-red-300' : 'border-border'
            } rounded-none focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="Kirjeldage oma eesmärki..."
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={fieldErrors.initialGoal ? 'text-red-600' : ''}>
              {fieldErrors.initialGoal || ''}
            </span>
            <span>{remainingChars} tähemärki jäänud</span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="companyType" className="block text-sm font-medium">
            Ettevõtte tüüp <Badge variant="primary">Nõutud</Badge>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Valige teie ettevõtet kõige paremini kirjeldav tüüp
          </p>
          <select
            id="companyType"
            name="companyType"
            value={formData.companyType}
            onChange={handleInputChange}
            className={`w-full p-3 border ${
              fieldErrors.companyType ? 'border-red-300' : 'border-border'
            } rounded-none bg-white focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="">Valige ettevõtte tüüp</option>
            {companyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.companyTypeText_et}
              </option>
            ))}
          </select>
          {fieldErrors.companyType && (
            <span className="text-xs text-red-600">{fieldErrors.companyType}</span>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full"
          >
            Alusta hindamist
          </Button>
        </div>
      </form>
    </Card>
  );
} 