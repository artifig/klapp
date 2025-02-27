import { getActiveCompanyTypes } from "@/lib/airtable";
import StartForm from "@/components/assessment/StartForm";
import { ErrorState } from "@/components/assessment/ErrorState";
import { type MethodCompanyType } from "@/lib/airtable";

export default async function AssessmentPage() {
  try {
    const companyTypes = await getActiveCompanyTypes().catch((error: Error): MethodCompanyType[] => {
      console.error('Error fetching company types:', error);
      return [];
    });
    
    if (!companyTypes.length) {
      return (
        <ErrorState 
          title="Ettevõtte tüüpe ei leitud"
          description="Kahjuks ei leitud ühtegi ettevõtte tüüpi. Veenduge, et Airtable'i API konfiguratsioon on korrektne."
          actionHref="/"
          actionText="Tagasi avalehele"
        />
      );
    }

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">AI-valmiduse hindamine</h1>
            <p className="text-muted-foreground">
              Tehnopoli AI-valmiduse hindamise tööriist aitab Sul hinnata ettevõtte valmisolekut
              tehisintellekti rakendamiseks. Hindamiseks vastake järgnevatele küsimustele.
            </p>
          </div>
          
          <div className="bg-card border border-border p-6 shadow-sm">
            <StartForm companyTypes={companyTypes} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading assessment page:', error);
    return (
      <ErrorState 
        title="Viga laadimisel"
        description={`Kahjuks tekkis viga: ${error instanceof Error ? error.message : 'Tundmatu viga'}. Veenduge, et Airtable'i API konfiguratsioon on korrektne.`}
        actionHref="/"
        actionText="Tagasi avalehele"
      />
    );
  }
}
