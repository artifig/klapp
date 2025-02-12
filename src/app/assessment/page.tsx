import { getActiveCompanyTypes } from "@/lib/airtable";
import StartForm from "@/components/assessment/StartForm";
import { ErrorState } from "@/components/assessment/ErrorState";

export default async function AssessmentPage() {
  try {
    const companyTypes = await getActiveCompanyTypes();
    
    if (!companyTypes.length) {
      return (
        <ErrorState 
          title="Ettevõtte tüüpe ei leitud"
          description="Kahjuks ei leitud ühtegi ettevõtte tüüpi. Palun proovige hiljem uuesti."
          backLink="/"
          backText="Tagasi avalehele"
        />
      );
    }

    return (
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <StartForm companyTypes={companyTypes} />
      </main>
    );
  } catch (error) {
    console.error('Error loading assessment page:', error);
    return (
      <ErrorState 
        title="Viga laadimisel"
        description="Kahjuks tekkis viga. Palun proovige hiljem uuesti."
        backLink="/"
        backText="Tagasi avalehele"
      />
    );
  }
}
