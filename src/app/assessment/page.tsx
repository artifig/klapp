import { getActiveCompanyTypes } from "@/lib/airtable";
import AssessmentForm from "@/components/AssessmentForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AssessmentPage() {
  const companyTypes = await getActiveCompanyTypes();

  return (
    <main className="max-w-6xl mx-auto px-6">
      <h1 className="text-3xl font-bold mb-8">AI-valmiduse hindamine</h1>
      
      <div className="grid gap-6">
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-tehnopol">Tere tulemast!</CardTitle>
            <CardDescription className="mt-1 text-xs">
              See hindamine aitab teil mõista oma ettevõtte praegust valmisolekut tehisintellekti rakendamiseks.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-tehnopol">Alusta hindamist</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Palun täitke järgnevad väljad, et alustada oma ettevõtte AI-valmiduse hindamist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssessmentForm companyTypes={companyTypes} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
