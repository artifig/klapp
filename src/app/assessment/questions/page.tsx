import { getAssessmentResponse, getCategories, getQuestions, getAnswers } from "@/lib/airtable";
import { QuestionForm } from "@/components/QuestionForm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    
    console.log('Assessment:', { id, companyType, responses });

    // Fetch categories for the company type
    const categories = await getCategories(companyType);
    console.log('Categories:', categories);
    
    if (!categories.length) {
      console.error('No categories found for company type:', companyType);
      return (
        <main className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">AI-valmiduse hindamine</h1>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-tehnopol">Küsimusi ei leitud</CardTitle>
              <CardDescription className="mt-1 text-xs">
                Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/assessment" className="text-tehnopol hover:text-tehnopol-dark">
                Tagasi hindamise algusesse
              </a>
            </CardContent>
          </Card>
        </main>
      );
    }
    
    // Fetch questions for all categories
    const questions = await getQuestions(categories.map(c => c.id));
    console.log('Questions:', questions);
    
    // Fetch answers for all questions
    const answers = await getAnswers(questions.map(q => q.id));
    console.log('Answers:', answers);

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
    console.log('Questions by category:', questionsByCategory);

    if (!questionsByCategory.length) {
      return (
        <main className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">AI-valmiduse hindamine</h1>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-tehnopol">Küsimusi ei leitud</CardTitle>
              <CardDescription className="mt-1 text-xs">
                Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/assessment" className="text-tehnopol hover:text-tehnopol-dark">
                Tagasi hindamise algusesse
              </a>
            </CardContent>
          </Card>
        </main>
      );
    }

    return (
      <main className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">AI-valmiduse hindamine</h1>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-tehnopol">Vastake küsimustele</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Palun vastake järgnevatele küsimustele, et hinnata oma ettevõtte valmisolekut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionForm 
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
      <main className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">AI-valmiduse hindamine</h1>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-tehnopol">Viga küsimuste laadimisel</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Kahjuks tekkis küsimuste laadimisel viga. Palun proovige uuesti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/assessment" className="text-tehnopol hover:text-tehnopol-dark">
              Tagasi algusesse
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }
}
