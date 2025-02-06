import { getActiveCompanyTypes } from "@/lib/airtable";
import AssessmentForm from "./AssessmentForm";

export default async function AssessmentPage() {
  const companyTypes = await getActiveCompanyTypes();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Ettevõtte AI-valmiduse hindamine
      </h1>
      
      <p className="mb-8 text-lg">
        Tere tulemast AI-valmiduse hindamise tööriista! See hindamine aitab teil mõista oma ettevõtte praegust valmisolekut tehisintellekti rakendamiseks.
      </p>

      <AssessmentForm companyTypes={companyTypes} />
    </main>
  );
}
