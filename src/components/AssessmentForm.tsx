'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="initialGoal"
          className="text-sm font-medium text-muted-foreground"
        >
          Mis on teie peamine äriline eesmärk seoses AI-ga?
        </label>
        <textarea
          id="initialGoal"
          name="initialGoal"
          required
          rows={4}
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="companyType"
          className="text-sm font-medium text-muted-foreground"
        >
          Ettevõtte tüüp
        </label>
        <select
          id="companyType"
          name="companyType"
          required
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Vali ettevõtte tüüp...</option>
          {companyTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.companyTypeText_et}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
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