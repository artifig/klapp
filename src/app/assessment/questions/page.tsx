import { getAssessmentResponse, getCategories, getQuestions, getAnswers } from "@/lib/airtable";
import { QuestionsForm } from "@/components/assessment/QuestionsForm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface AssessmentResponse {
  questionId: string;
  answerId: string;
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
    // Fetch the assessment response
    const assessment = await getAssessmentResponse(id);
    if (!assessment || !assessment.isActive) {
      redirect('/assessment');
    }

    // Parse the response content
    const content = JSON.parse(assessment.responseContent);
    const { companyType, responses } = content;
    
    // Fetch categories for the company type
    const categories = await getCategories(companyType);
    
    if (!categories.length) {
      return (
        <main>
          <h1>AI-valmiduse hindamine</h1>
          <Card>
            <CardHeader>
              <CardTitle>Küsimusi ei leitud</CardTitle>
              <CardDescription>
                Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/assessment">
                Tagasi hindamise algusesse
              </a>
            </CardContent>
          </Card>
        </main>
      );
    }
    
    // Fetch questions for all categories
    const questions = await getQuestions(categories.map(c => c.id));
    
    // Fetch answers for all questions
    const answers = await getAnswers(questions.map(q => q.id));

    // Group questions by category
    const questionsByCategory = categories.map(category => ({
      ...category,
      questions: questions
        .filter(q => q.MethodCategories.includes(category.id))
        .map(question => ({
          ...question,
          answers: answers.filter(a => a.MethodQuestions.includes(question.id)),
          selectedAnswer: responses.find((r: AssessmentResponse) => r.questionId === question.id)?.answerId
        }))
    }));

    if (!questionsByCategory.length) {
      return (
        <main>
          <h1>AI-valmiduse hindamine</h1>
          <Card>
            <CardHeader>
              <CardTitle>Küsimusi ei leitud</CardTitle>
              <CardDescription>
                Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/assessment">
                Tagasi hindamise algusesse
              </a>
            </CardContent>
          </Card>
        </main>
      );
    }

    return (
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <Card>
          <CardHeader>
            <CardTitle>Vastake küsimustele</CardTitle>
            <CardDescription>
              Palun vastake järgnevatele küsimustele, et hinnata oma ettevõtte valmisolekut.
            </CardDescription>
          </CardHeader>
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
    return (
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <Card>
          <CardHeader>
            <CardTitle>Viga küsimuste laadimisel</CardTitle>
            <CardDescription>
              Kahjuks tekkis küsimuste laadimisel viga. Palun proovige uuesti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/assessment">
              Tagasi algusesse
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }
}
