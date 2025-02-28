import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionsForm } from "@/components/assessment/QuestionsForm";
import { ErrorState } from "@/components/assessment/ErrorState";
import { fetchQuestionsData } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QuestionsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : undefined;
  
  if (!id) {
    redirect('/assessment');
  }

  try {
    // This is a server component, so this call happens on the server
    const { questionsByCategory, responses } = await fetchQuestionsData(id);

    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary mb-2">AI-valmiduse hindamine</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vastake kõikidele küsimustele, et saada põhjalik ülevaade oma ettevõtte AI-valmidusest
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-gray-100">
              <CardTitle className="text-xl text-secondary">Hindamise küsimused</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <QuestionsForm 
                assessmentId={id}
                categories={questionsByCategory}
                existingResponses={responses}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading questions page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <ErrorState 
          title="Viga küsimuste laadimisel"
          description={
            errorMessage === 'Assessment not found or inactive' ? 
              'Hindamist ei leitud või see pole aktiivne.' :
            errorMessage === 'No categories found for company type' ?
              'Valitud ettevõtte tüübi jaoks ei leitud küsimusi.' :
            errorMessage === 'No questions found for categories' ?
              'Valitud kategooriate jaoks ei leitud küsimusi.' :
              'Kahjuks tekkis küsimuste laadimisel viga. Palun proovige uuesti.'
          }
        />
      </div>
    );
  }
}
