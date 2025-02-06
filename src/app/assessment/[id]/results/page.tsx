import { getAssessmentResponse, getCategories, getQuestions, getAnswers } from "@/lib/airtable";
import { redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

interface AssessmentResponse {
  questionId: string;
  answerId: string;
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = params;
  
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
    
    // Fetch questions for all categories
    const questions = await getQuestions(categories.map(c => c.id));
    
    // Fetch all possible answers
    const answers = await getAnswers(questions.map(q => q.id));

    // Calculate scores by category
    const categoryScores = categories.map(category => {
      // Get questions for this category
      const categoryQuestions = questions.filter(q => 
        q.MethodCategories.includes(category.id)
      );

      // Calculate average score for the category
      const categoryResponses = categoryQuestions
        .map(question => {
          const response = responses.find((r: AssessmentResponse) => r.questionId === question.id);
          if (!response) return null;
          
          const answer = answers.find(a => a.id === response.answerId);
          return answer ? answer.answerScore : null;
        })
        .filter((score): score is number => score !== null);

      const averageScore = categoryResponses.length
        ? Math.round(categoryResponses.reduce((a, b) => a + b, 0) / categoryResponses.length)
        : 0;

      return {
        ...category,
        score: averageScore,
        questionCount: categoryQuestions.length,
        answeredCount: categoryResponses.length
      };
    });

    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Hindamise tulemused
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Teie eesmärk:</h2>
          <p className="text-lg bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            {assessment.initialGoal}
          </p>
        </div>

        <div className="space-y-8">
          {categoryScores.map(category => (
            <div key={category.id} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{category.categoryText_et}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {category.categoryDescription_et}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {category.score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Vastatud: {category.answeredCount}/{category.questionCount}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="/assessment"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Alusta uut hindamist
          </a>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading results page:', error);
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-red-600">
          Viga tulemuste laadimisel
        </h1>
        <p className="text-lg mb-4">
          Kahjuks tekkis tulemuste laadimisel viga. Palun proovige uuesti.
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