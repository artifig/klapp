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
  type MethodAnswer,
  type SolutionProvider
} from "@/lib/airtable";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";
import { ResultsSummary } from "@/components/assessment/ResultsSummary";
import { AiFeedback } from "@/components/assessment/AiFeedback";
import { DetailedAnalysis } from "@/components/assessment/DetailedAnalysis";
import { ExportForm } from "@/components/assessment/ExportForm";
import type { CategoryScore } from "@/lib/types";

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

      const averageScore = categoryResponses.length
        ? Math.round(categoryResponses.reduce((a, b) => a + b, 0) / categoryResponses.length)
        : 0;

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

      try {
        const [recommendations, solutions] = await Promise.all([
          getRecommendationsForCategory(category.id, scoreLevel, companyType),
          getExampleSolutionsForCategory(category.id, scoreLevel, companyType)
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
    const overallScore = Math.round(
      categoryScores.reduce((sum, cat) => sum + cat.score, 0) / categoryScores.length
    );

    // Get top 3 most occurring providers
    const getTopProviders = (categoryScores: CategoryScore[]) => {
      const providerCounts = new Map<string, { count: number; provider: SolutionProvider }>();
      
      categoryScores.forEach(category => {
        // Count providers from recommendations
        category.recommendations.forEach(rec => {
          rec.providers.forEach(provider => {
            const existing = providerCounts.get(provider.id);
            if (existing) {
              existing.count += 1;
            } else {
              providerCounts.set(provider.id, { count: 1, provider });
            }
          });
        });
        
        // Count providers from solutions
        category.solutions.forEach(solution => {
          solution.providers.forEach(provider => {
            const existing = providerCounts.get(provider.id);
            if (existing) {
              existing.count += 1;
            } else {
              providerCounts.set(provider.id, { count: 1, provider });
            }
          });
        });
      });

      return Array.from(providerCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.provider);
    };

    const topProviders = getTopProviders(categoryScores);

    return (
      <main>
        <h1>AI-valmiduse hindamise tulemused</h1>
        
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

        <AiFeedback />

        <DetailedAnalysis categoryScores={categoryScores} />

        <ExportForm assessmentId={id} />
      </main>
    );
  } catch (error) {
    console.error('Error loading results page:', error);
    return (
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <Card>
          <CardHeader>
            <CardTitle>Viga tulemuste laadimisel</CardTitle>
            <CardDescription>
              Kahjuks tekkis tulemuste laadimisel viga. Palun proovige uuesti.
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
