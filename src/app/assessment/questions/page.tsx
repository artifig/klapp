import { getAssessmentResponse, getCategories, getQuestions, getAnswers } from "@/lib/airtable";
import { QuestionForm } from "@/components/QuestionForm";
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
        <main>
          <h1>AI-valmiduse hindamine</h1>
          <div className="category-section">
            <h2>Küsimusi ei leitud</h2>
            <p>
              Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
            </p>
            <a href="/assessment">Tagasi hindamise algusesse</a>
          </div>
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
        <main>
          <h1>AI-valmiduse hindamine</h1>
          <div className="category-section">
            <h2>Küsimusi ei leitud</h2>
            <p>
              Valitud ettevõtte tüübi jaoks ei leitud küsimusi. Palun proovige uuesti või võtke ühendust administraatoriga.
            </p>
            <a href="/assessment">Tagasi hindamise algusesse</a>
          </div>
        </main>
      );
    }

    return (
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <p className="intro-text">
          Vastake järgnevatele küsimustele, et hinnata oma ettevõtte valmisolekut.
        </p>
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
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <div className="category-section">
          <h2>Viga küsimuste laadimisel</h2>
          <p>Kahjuks tekkis küsimuste laadimisel viga. Palun proovige uuesti.</p>
          <a href="/assessment">Tagasi algusesse</a>
        </div>
      </main>
    );
  }
}
