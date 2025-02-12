'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/UiButton";
import { type MethodCompanyType } from "@/lib/airtable";
import { createAssessment } from "@/lib/api";

interface StartFormProps {
  companyTypes: MethodCompanyType[];
}

export default function StartForm({ companyTypes }: StartFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      initialGoal: formData.get("initialGoal") as string,
      companyType: formData.get("companyType") as string,
    };

    try {
      const result = await createAssessment(data);
      router.push(`/assessment/questions?id=${result.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Viga hindamise alustamisel. Palun proovige uuesti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div role="alert">{error}</div>}

      <div>
        <label htmlFor="initialGoal">
          Mis on teie peamine äriline eesmärk seoses AI-ga?
        </label>
        <textarea
          id="initialGoal"
          name="initialGoal"
          required
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="companyType">
          Ettevõtte tüüp
        </label>
        <select
          id="companyType"
          name="companyType"
          required
        >
          <option value="">Vali ettevõtte tüüp...</option>
          {companyTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.companyTypeText_et}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saadan..." : "Alusta hindamist"}
        </Button>
      </div>
    </form>
  );
} 