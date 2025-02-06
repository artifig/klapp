import { 
  getAssessmentResponse, 
  getCategories, 
  getQuestions, 
  getAnswers,
  getRecommendationsForCategory,
  getExampleSolutionsForCategory,
  type MethodCategory,
  type MethodQuestion,
  type MethodAnswer,
  type MethodRecommendation,
  type MethodExampleSolution
} from "@/lib/airtable";
import { redirect } from "next/navigation";

interface AssessmentResponse {
  questionId: string;
  answerId: string;
}

interface CategoryScore extends MethodCategory {
  score: number;
  questionCount: number;
  answeredCount: number;
  maturityLevel: string;
  maturityColor: 'red' | 'yellow' | 'green';
  recommendations: MethodRecommendation[];
  solutions: MethodExampleSolution[];
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
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
    const questions = await getQuestions(categories.map((category: MethodCategory) => category.id));
    
    // Fetch all possible answers
    const answers = await getAnswers(questions.map((question: MethodQuestion) => question.id));

    // Calculate scores and fetch recommendations/solutions for each category
    const categoryScores = await Promise.all(categories.map(async (category: MethodCategory) => {
      // Get questions for this category
      const categoryQuestions = questions.filter((question: MethodQuestion) =>
        question.MethodCategories.includes(category.id)
      );

      // Calculate average score for the category
      const categoryResponses = categoryQuestions
        .map((question: MethodQuestion) => {
          const response = responses.find((r: AssessmentResponse) => r.questionId === question.id);
          if (!response) return null;
          
          const answer = answers.find((answer: MethodAnswer) => answer.id === response.answerId);
          return answer ? answer.answerScore : null;
        })
        .filter((score): score is number => score !== null);

      const averageScore = categoryResponses.length
        ? Math.round(categoryResponses.reduce((a, b) => a + b, 0) / categoryResponses.length)
        : 0;

      // Determine maturity level based on score
      let maturityLevel = '';
      let maturityColor: 'red' | 'yellow' | 'green';
      let scoreLevel: 'red' | 'yellow' | 'green';
      
      if (averageScore < 40) {
        maturityLevel = 'Punane';
        maturityColor = 'red';
        scoreLevel = 'red';
      } else if (averageScore < 70) {
        maturityLevel = 'Kollane';
        maturityColor = 'yellow';
        scoreLevel = 'yellow';
      } else {
        maturityLevel = 'Roheline';
        maturityColor = 'green';
        scoreLevel = 'green';
      }

      // Fetch recommendations and solutions
      const [recommendations, solutions] = await Promise.all([
        getRecommendationsForCategory(category.id, scoreLevel, companyType),
        getExampleSolutionsForCategory(category.id, scoreLevel, companyType)
      ]);

      return {
        ...category,
        score: averageScore,
        questionCount: categoryQuestions.length,
        answeredCount: categoryResponses.length,
        maturityLevel,
        maturityColor,
        recommendations,
        solutions
      };
    }));

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

        <div className="space-y-12">
          {categoryScores.map((category: CategoryScore) => (
            <div key={category.id} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              {/* Category header */}
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
                  <div className={`text-sm mt-1 font-medium ${
                    category.maturityColor === 'red' ? 'text-red-600' :
                    category.maturityColor === 'yellow' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {category.maturityLevel} tase
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    category.maturityColor === 'red' ? 'bg-red-600' :
                    category.maturityColor === 'yellow' ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${category.score}%` }}
                />
              </div>

              {/* Recommendations section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Soovitused</h4>
                <div className="space-y-4">
                  {category.recommendations.map((recommendation: MethodRecommendation) => (
                    <div key={recommendation.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">{recommendation.recommendationText_et}</h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {recommendation.recommendationDescription_et}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example solutions section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Näidislahendused</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.solutions.map((solution: MethodExampleSolution) => (
                    <div key={solution.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">{solution.exampleSolutionText_et}</h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {solution.exampleSolutionDescription_et}
                      </p>
                    </div>
                  ))}
                </div>
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