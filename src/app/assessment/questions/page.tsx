import { getAssessmentResponse, getCategories, getQuestions, getAnswers } from "@/lib/airtable";
import { QuestionForm } from "./question-form";
import { redirect } from "next/navigation";

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
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-red-600">
            Küsimusi ei leitud
          </h1>
          <p className="text-lg mb-4">
            Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
          </p>
          <a
            href="/assessment"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tagasi hindamise algusesse
          </a>
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
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-red-600">
            Küsimusi ei leitud
          </h1>
          <p className="text-lg mb-4">
            Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
          </p>
          <a
            href="/assessment"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tagasi hindamise algusesse
          </a>
        </main>
      );
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Hindamise küsimused
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Teie eesmärk:</h2>
          <p className="text-lg bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            {assessment.initialGoal}
          </p>
        </div>

        <QuestionForm 
          assessmentId={id}
          categories={questionsByCategory}
          existingResponses={responses}
        />
      </main>
    );
  } catch (error) {
    console.error('Error loading questions page:', error);
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-red-600">
          Viga küsimuste laadimisel
        </h1>
        <p className="text-lg mb-4">
          Kahjuks tekkis küsimuste laadimisel viga. Palun proovige uuesti.
        </p>
        <a
          href="/assessment"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tagasi hindamise algusesse
        </a>
      </main>
    );
  }
}
