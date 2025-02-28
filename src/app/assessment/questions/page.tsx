import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
      <main>
        <h1>AI-valmiduse hindamine</h1>
        
        <Card>
          <CardContent>
            <QuestionsForm 
              assessmentId={id}
              categories={questionsByCategory}
              existingResponses={responses}
            />
          </CardContent>
        </Card>
      </main>
    );
  } catch (error) {
    console.error('Error loading questions page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return (
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
    );
  }
}
