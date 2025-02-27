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
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary mb-2">AI-valmiduse hindamise tulemused</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Teie ettevõtte AI-valmiduse hindamise tulemused ja soovitused edasisteks sammudeks
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto space-y-12">
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
          
          <AiFeedback 
            assessmentId={id}
            initialCompanyType={companyType}
            initialGoal={assessment.initialGoal}
            overallScore={overallScore}
          />
          
          <DetailedAnalysis 
            categoryScores={categoryScores}
          />
          
          <ExportForm 
            assessmentId={id}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading results page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <ErrorState 
          title="Viga tulemuste laadimisel"
          description={
            errorMessage === 'Assessment not found or inactive' ? 
              'Hindamist ei leitud või see pole aktiivne.' :
              'Kahjuks tekkis tulemuste laadimisel viga. Palun proovige uuesti.'
          }
        />
      </div>
    );
  }
}
