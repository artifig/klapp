import { getActiveCompanyTypes } from "@/lib/airtable";
import AssessmentForm from "@/components/AssessmentForm";

export default async function AssessmentPage() {
  const companyTypes = await getActiveCompanyTypes();

  return (
    <main className="tehnopol-container-md">
      <div className="tehnopol-stack">
        <h1 className="tehnopol-gradient-text text-3xl font-bold">
          Ettevõtte AI-valmiduse hindamine
        </h1>
        
        <p className="tehnopol-text text-lg">
          Tere tulemast AI-valmiduse hindamise tööriista! See hindamine aitab teil mõista oma ettevõtte praegust valmisolekut tehisintellekti rakendamiseks.
        </p>

        <div className="tehnopol-card">
          <AssessmentForm companyTypes={companyTypes} />
        </div>
      </div>
    </main>
  );
}
