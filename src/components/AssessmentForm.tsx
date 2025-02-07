'use client';

import { Form } from "@radix-ui/react-form";
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
        // Handle error
        console.error("Failed to create assessment");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form className="space-y-6" onSubmit={handleSubmit}>
      <div className="tehnopol-form-group">
        <label className="tehnopol-form-label" htmlFor="initialGoal">
          Mis on teie peamine äriline eesmärk seoses AI-ga?
        </label>
        <textarea
          id="initialGoal"
          name="initialGoal"
          required
          className="tehnopol-textarea"
          rows={4}
        />
      </div>

      <div className="tehnopol-form-group">
        <label className="tehnopol-form-label" htmlFor="companyType">
          Ettevõtte tüüp
        </label>
        <select
          id="companyType"
          name="companyType"
          required
          className="tehnopol-select"
        >
          <option value="">Vali ettevõtte tüüp...</option>
          {companyTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.companyTypeText_et}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="tehnopol-btn tehnopol-btn-primary"
      >
        {isSubmitting ? "Saadan..." : "Alusta hindamist"}
      </button>
    </Form>
  );
} 