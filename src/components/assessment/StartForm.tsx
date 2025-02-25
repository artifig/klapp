'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { type MethodCompanyType } from "@/lib/airtable";
import { createAssessment } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";

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
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div role="alert" className="error">{error}</div>}

          <div className="form-group">
            <label htmlFor="initialGoal">
              Mis on teie peamine äriline eesmärk seoses AI-ga? *
              <span className="helper-text">
                Kirjeldage, mida soovite AI abil oma ettevõttes saavutada
              </span>
            </label>
            <textarea
              id="initialGoal"
              name="initialGoal"
              required
              rows={4}
              maxLength={500}
              value={formData.initialGoal}
              onChange={handleInputChange}
              placeholder="Näiteks: Soovin automatiseerida klienditeenindust, et pakkuda 24/7 teenindust..."
              className={fieldErrors.initialGoal ? 'error' : ''}
              aria-describedby="initialGoal-error initialGoal-counter"
            />
            <div className="input-footer">
              {fieldErrors.initialGoal && (
                <div id="initialGoal-error" className="error-text">
                  {fieldErrors.initialGoal}
                </div>
              )}
              <div id="initialGoal-counter" className="char-counter">
                {remainingChars} tähemärki järel
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="companyType">
              Ettevõtte tüüp *
              <span className="helper-text">
                Valige oma ettevõtte tüüp, et saada täpsemaid soovitusi
              </span>
            </label>
            <select
              id="companyType"
              name="companyType"
              required
              value={formData.companyType}
              onChange={handleInputChange}
              className={fieldErrors.companyType ? 'error' : ''}
              aria-describedby="companyType-error"
            >
              <option value="">Vali ettevõtte tüüp...</option>
              {companyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.companyTypeText_et}
                </option>
              ))}
            </select>
            {fieldErrors.companyType && (
              <div id="companyType-error" className="error-text">
                {fieldErrors.companyType}
              </div>
            )}
          </div>

          <div className="button-group">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saadan..." : "Alusta hindamist"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 