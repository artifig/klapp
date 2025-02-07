'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type MethodCompanyType } from "@/lib/airtable";

interface AssessmentFormProps {
  companyTypes: MethodCompanyType[];
}

export default function AssessmentForm({ companyTypes }: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      initialGoal: formData.get("initialGoal"),
      companyType: formData.get("companyType"),
    };

    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/assessment/questions?id=${result.id}`);
      } else {
        console.error("Failed to create assessment");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <div className="nav-buttons">
        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saadan..." : "Alusta hindamist"}
        </button>
      </div>
    </form>
  );
} 