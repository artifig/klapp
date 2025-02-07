import { getActiveCompanyTypes } from "@/lib/airtable";
import AssessmentForm from "./AssessmentForm";

export default async function AssessmentPage() {
  const companyTypes = await getActiveCompanyTypes();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="tehnopol-gradient-text text-3xl font-bold mb-6">
        Ettevõtte AI-valmiduse hindamine
      </h1>
      
      <p className="tehnopol-text text-lg mb-8">
        Tere tulemast AI-valmiduse hindamise tööriista! See hindamine aitab teil mõista oma ettevõtte praegust valmisolekut tehisintellekti rakendamiseks.
      </p>

      <div className="tehnopol-card">
        <AssessmentForm companyTypes={companyTypes} />
      </div>
    </main>
  );
}
