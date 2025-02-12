import { getActiveCompanyTypes } from "@/lib/airtable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";
import StartForm from "@/components/assessment/StartForm";

export default async function AssessmentPage() {
  const companyTypes = await getActiveCompanyTypes();

  return (
    <main>
      <h1>AI-valmiduse hindamine</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tere tulemast!</CardTitle>
          <CardDescription>
            See hindamine aitab teil mõista oma ettevõtte praegust valmisolekut tehisintellekti rakendamiseks.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alusta hindamist</CardTitle>
          <CardDescription>
            Palun täitke järgnevad väljad, et alustada oma ettevõtte AI-valmiduse hindamist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StartForm companyTypes={companyTypes} />
        </CardContent>
      </Card>
    </main>
  );
}
