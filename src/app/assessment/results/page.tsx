import { 
  getAssessmentResponse, 
  getCategories, 
  getQuestions, 
  getAnswers,
  getRecommendationsForCategory,
  getExampleSolutionsForCategory,
  getProvidersForRecommendation,
  getProvidersForExampleSolution,
  type MethodCategory,
  type MethodQuestion,
  type MethodAnswer
} from "@/lib/airtable";
import { redirect } from "next/navigation";
import { ResultsSummary } from "@/components/assessment/ResultsSummary";
import { AiFeedback } from "@/components/assessment/AiFeedback";
import { DetailedAnalysis } from "@/components/assessment/DetailedAnalysis";
import { ExportForm } from "@/components/assessment/ExportForm";
import { ErrorState } from "@/components/assessment/ErrorState";
import { getTopProviders, calculateMaturityLevel, calculateAverageScore } from "@/lib/utils";

interface AssessmentResponse {
  questionId: string;
  answerId: string;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id as string;

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
    
    // Fetch questions for all categories
    const questions = await getQuestions(categories.map((category: MethodCategory) => category.id));
    
    // Fetch all possible answers
    const answers = await getAnswers(questions.map((question: MethodQuestion) => question.id));

    // Calculate scores and fetch recommendations/solutions for each category
    const categoryScores = await Promise.all(categories.map(async (category: MethodCategory) => {
      const categoryQuestions = questions.filter((question: MethodQuestion) =>
        question.MethodCategories.includes(category.id)
      );

      const categoryResponses = categoryQuestions
        .map((question: MethodQuestion) => {
          const response = responses.find((r: AssessmentResponse) => r.questionId === question.id);
          if (!response) return null;
          
          const answer = answers.find((answer: MethodAnswer) => answer.id === response.answerId);
          return answer ? answer.answerScore : null;
        })
        .filter((score): score is number => score !== null);

      const averageScore = calculateAverageScore(categoryResponses);
      const { level: maturityLevel, color: maturityColor } = calculateMaturityLevel(averageScore);

      try {
        const [recommendations, solutions] = await Promise.all([
          getRecommendationsForCategory(category.id, maturityColor, companyType),
          getExampleSolutionsForCategory(category.id, maturityColor, companyType)
        ]);

        const recommendationsWithProviders = await Promise.all(
          recommendations.map(async (rec) => {
            try {
              const providers = await getProvidersForRecommendation(rec.id);
              return { ...rec, providers };
            } catch (error) {
              console.error('Error fetching providers for recommendation:', rec.id, error);
              return { ...rec, providers: [] };
            }
          })
        );

        const solutionsWithProviders = await Promise.all(
          solutions.map(async (sol) => {
            try {
              const providers = await getProvidersForExampleSolution(sol.id);
              return { ...sol, providers };
            } catch (error) {
              console.error('Error fetching providers for solution:', sol.id, error);
              return { ...sol, providers: [] };
            }
          })
        );

        return {
          ...category,
          score: averageScore,
          questionCount: categoryQuestions.length,
          answeredCount: categoryResponses.length,
          maturityLevel,
          maturityColor,
          recommendations: recommendationsWithProviders,
          solutions: solutionsWithProviders
        };
      } catch (error) {
        console.error('Error processing recommendations/solutions for category:', category.id, error);
        return {
          ...category,
          score: averageScore,
          questionCount: categoryQuestions.length,
          answeredCount: categoryResponses.length,
          maturityLevel,
          maturityColor,
          recommendations: [],
          solutions: []
        };
      }
    }));

    // Calculate overall score
    const overallScore = calculateAverageScore(categoryScores.map(cat => cat.score));
    const topProviders = getTopProviders(categoryScores);

    return (
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          <ResultsSummary 
            initialGoal={assessment.initialGoal}
            overallScore={overallScore}
            categories={categoryScores.map(cat => ({
              name: cat.categoryText_et,
              level: cat.maturityColor,
              value: cat.score
            }))}
            topProviders={topProviders}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <AiFeedback />
            </div>
            <div>
              <DetailedAnalysis categoryScores={categoryScores} />
            </div>
          </div>
          
          <div className="mt-8 bg-accent/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Salvesta tulemused</h3>
            <ExportForm assessmentId={id} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading results page:', error);
    return (
      <ErrorState 
        title="Viga tulemuste laadimisel"
        description="Kahjuks tekkis tulemuste laadimisel viga. Palun proovige uuesti."
      />
    );
  }
}
