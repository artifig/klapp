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
  type MethodRecommendation,
  type MethodExampleSolution,
  type SolutionProvider
} from "@/lib/airtable";
import { redirect } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ResultsRadarChart } from "@/components/ResultsRadarChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  recommendations: (MethodRecommendation & { providers: SolutionProvider[] })[];
  solutions: (MethodExampleSolution & { providers: SolutionProvider[] })[];
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

      const [recommendations, solutions] = await Promise.all([
        getRecommendationsForCategory(category.id, scoreLevel, companyType),
        getExampleSolutionsForCategory(category.id, scoreLevel, companyType)
      ]);

      const recommendationsWithProviders = await Promise.all(
        recommendations.map(async (rec) => {
          const providers = await getProvidersForRecommendation(rec.id);
          return { ...rec, providers };
        })
      );

      const solutionsWithProviders = await Promise.all(
        solutions.map(async (sol) => {
          const providers = await getProvidersForExampleSolution(sol.id);
          return { ...sol, providers };
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
    }));

    return (
      <main className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">AI-valmiduse hindamise tulemused</h1>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="flex items-center justify-center">
            <ResultsRadarChart 
              categories={categoryScores.map(cat => ({
                name: cat.categoryText_et,
                level: cat.maturityColor,
                value: cat.score
              }))}
            />
          </div>
          
          <div className="grid grid-rows-2 gap-4 h-[350px]">
            <Card className="flex flex-col">
              <CardHeader className="pb-2 flex-none">
                <CardTitle>Teie eesmärk</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center text-center px-6">
                <p className="text-base text-muted-foreground">{assessment.initialGoal}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="pb-2 flex-none">
                <CardTitle>Üldine tulemus</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="text-5xl font-bold text-tehnopol mb-2">45%</div>
                <p className="text-base text-muted-foreground">Teie ettevõtte valmisolek</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-tehnopol">Tagasiside tehisaru analüüsist</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Teie ettevõte näitab tugevat potentsiaali mitmes valdkonnas. Eriti silmapaistev on teie sooritus kvaliteedijuhtimise ja innovatsiooni valdkonnas. Siiski on mõned võimalused edasisteks parandusteks, eriti seoses digitaliseerimise ja andmepõhise otsustamisega.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-1 w-1 rounded-full bg-green-600"></div>
                  <h3 className="text-xs font-semibold">Peamised tugevused</h3>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-0.5 w-0.5 rounded-full bg-muted-foreground/30"></span>
                    <span>Tugev strateegiline planeerimine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-0.5 w-0.5 rounded-full bg-muted-foreground/30"></span>
                    <span>Efektiivne meeskonnatöö</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-0.5 w-0.5 rounded-full bg-muted-foreground/30"></span>
                    <span>Kliendikeskne lähenemine</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="h-1 w-1 rounded-full bg-orange-600"></div>
                  <h3 className="text-xs font-semibold">Arendamist vajavad valdkonnad</h3>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-0.5 w-0.5 rounded-full bg-muted-foreground/30"></span>
                    <span>Digitaalsete lahenduste integreerimine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-0.5 w-0.5 rounded-full bg-muted-foreground/30"></span>
                    <span>Andmepõhine otsustusprotsess</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-0.5 w-0.5 rounded-full bg-muted-foreground/30"></span>
                    <span>Automatiseerimine ja protsesside optimeerimine</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-muted-foreground italic border-t pt-2">
              * See tagasiside on genereeritud tehisintellekti poolt, põhinedes teie vastustel hindamisküsimustele.
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="grid grid-cols-3 gap-2">
            {categoryScores.map((category: CategoryScore) => {
              const levelClass = category.maturityLevel === 'Roheline' 
                ? 'level-green' 
                : category.maturityLevel === 'Kollane' 
                  ? 'level-yellow' 
                  : 'level-red';
                  
              return (
                <Dialog key={category.id}>
                  <DialogTrigger asChild>
                    <button 
                      className={`accordion-section category-section ${levelClass} w-full text-left`}
                    >
                      <div className="w-full">
                        <h3 className="text-xs">{category.categoryText_et}</h3>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="p-0 overflow-auto max-h-[80vh]">
                    <DialogHeader className="p-6 pb-3 border-b">
                      <DialogTitle className="text-center">{category.categoryText_et}</DialogTitle>
                      <DialogDescription className="text-center">
                        {category.categoryDescription_et}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-center mt-10">Vastatud: {category.answeredCount}/{category.questionCount}</p>

                      {category.recommendations.length > 0 && (
                        <div className="space-y-3 mt-10">
                          <h4 className="text-sm font-semibold text-center">Soovitused</h4>
                          {category.recommendations.map((recommendation) => (
                            <article key={recommendation.id} className="bg-muted/50 rounded-lg p-4 mt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-center">{recommendation.recommendationText_et}</h5>
                                  <p className="text-sm text-muted-foreground mt-4 text-center">{recommendation.recommendationDescription_et}</p>
                                </div>
                                {recommendation.providers.length > 0 && (
                                  <div className="flex -space-x-2 shrink-0">
                                    {recommendation.providers.map((provider) => (
                                      <Avatar key={provider.id} className="border-2 border-white h-8 w-8">
                                        {provider.providerLogo?.[0] ? (
                                          <AvatarImage
                                            src={provider.providerLogo[0].thumbnails.small.url}
                                            alt={provider.providerName_et}
                                          />
                                        ) : (
                                          <AvatarFallback className="text-xs">
                                            {provider.providerName_et.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}

                      {category.solutions.length > 0 && (
                        <div className="space-y-3 mt-10">
                          <h4 className="text-sm font-semibold text-center">Näidislahendused</h4>
                          {category.solutions.map((solution) => (
                            <article key={solution.id} className="bg-muted/50 rounded-lg p-4 mt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-center">{solution.exampleSolutionText_et}</h5>
                                  <p className="text-sm text-muted-foreground mt-4 text-center">{solution.exampleSolutionDescription_et}</p>
                                </div>
                                {solution.providers.length > 0 && (
                                  <div className="flex -space-x-2 shrink-0">
                                    {solution.providers.map((provider) => (
                                      <Avatar key={provider.id} className="border-2 border-white h-8 w-8">
                                        {provider.providerLogo?.[0] ? (
                                          <AvatarImage
                                            src={provider.providerLogo[0].thumbnails.small.url}
                                            alt={provider.providerName_et}
                                          />
                                        ) : (
                                          <AvatarFallback className="text-xs">
                                            {provider.providerName_et.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading results page:', error);
    return (
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <div className="category-section">
          <h2>Viga tulemuste laadimisel</h2>
          <p>Kahjuks tekkis tulemuste laadimisel viga. Palun proovige uuesti.</p>
          <a href="/assessment">Tagasi algusesse</a>
        </div>
      </main>
    );
  }
}
