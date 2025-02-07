import { getActiveCompanyTypes } from "@/lib/airtable";
import AssessmentForm from "@/components/AssessmentForm";

export default async function AssessmentPage() {
  const companyTypes = await getActiveCompanyTypes();

  return (
    <main>
      <h1>AI-valmiduse hindamine</h1>
      <p className="intro-text">
        Tere tulemast! See hindamine aitab teil mõista oma ettevõtte praegust valmisolekut tehisintellekti rakendamiseks.
      </p>

      <div className="category-section">
        <h2>Alusta hindamist</h2>
        <p>
          Palun täitke järgnevad väljad, et alustada oma ettevõtte AI-valmiduse hindamist.
        </p>
        <AssessmentForm companyTypes={companyTypes} />
      </div>
    </main>
  );
}
