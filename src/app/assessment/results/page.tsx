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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/UiAvatar";
import { ResultsChart } from "@/components/assessment/ResultsChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/UiDialog";
import { Button } from "@/components/ui/UiButton";

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
        
        <div>
          <div>
            <ResultsChart 
              categories={categoryScores.map(cat => ({
                name: cat.categoryText_et,
                level: cat.maturityColor,
                value: cat.score
              }))}
            />
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Teie eesmärk</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{assessment.initialGoal}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Üldine tulemus</CardTitle>
              </CardHeader>
              <CardContent>
                <div>{overallScore}%</div>
                <p>Teie ettevõtte valmisolek</p>
              </CardContent>
            </Card>

            {topProviders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Soovitatud teenusepakkujad</CardTitle>
                  <CardDescription>
                    Teie ettevõtte vajadustele kõige paremini vastavad teenusepakkujad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    {topProviders.map((provider) => (
                      <a
                        key={provider.id}
                        href={provider.providerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Avatar>
                          <AvatarImage 
                            src={provider.providerLogo?.[0]?.url} 
                            alt={provider.providerName_et} 
                          />
                          <AvatarFallback>
                            {provider.providerName_et.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4>{provider.providerName_et}</h4>
                          <p>{provider.providerDescription_et}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tagasiside tehisaru analüüsist</CardTitle>
            <CardDescription>
              Teie ettevõte näitab tugevat potentsiaali mitmes valdkonnas. Eriti silmapaistev on teie sooritus kvaliteedijuhtimise ja innovatsiooni valdkonnas. Siiski on mõned võimalused edasisteks parandusteks, eriti seoses digitaliseerimise ja andmepõhise otsustamisega.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <div>
                <div>
                  <div></div>
                  <h3>Peamised tugevused</h3>
                </div>
                <ul>
                  <li>
                    <span></span>
                    <span>Tugev strateegiline planeerimine</span>
                  </li>
                  <li>
                    <span></span>
                    <span>Efektiivne meeskonnatöö</span>
                  </li>
                  <li>
                    <span></span>
                    <span>Kliendikeskne lähenemine</span>
                  </li>
                </ul>
              </div>

              <div>
                <div>
                  <div></div>
                  <h3>Arendamist vajavad valdkonnad</h3>
                </div>
                <ul>
                  <li>
                    <span></span>
                    <span>Digitaalsete lahenduste integreerimine</span>
                  </li>
                  <li>
                    <span></span>
                    <span>Andmepõhine otsustusprotsess</span>
                  </li>
                  <li>
                    <span></span>
                    <span>Automatiseerimine ja protsesside optimeerimine</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              * See tagasiside on genereeritud tehisintellekti poolt, põhinedes teie vastustel hindamisküsimustele.
            </div>
          </CardContent>
        </Card>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              Vaata täielikku analüüsi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Täielik AI-valmiduse analüüs</DialogTitle>
              <DialogDescription>
                Detailne ülevaade kõikidest valdkondadest koos soovituste ja lahendustega
              </DialogDescription>
            </DialogHeader>
            <div>
              {categoryScores.map((category: CategoryScore) => (
                <div key={category.id}>
                  <h3>{category.categoryText_et}</h3>
                  <div>
                    <span>{category.score}%</span>
                    <span>{category.maturityLevel}</span>
                  </div>
                  <p>{category.categoryDescription_et}</p>
                  
                  <div>
                    <h4>Soovitused</h4>
                    <ul>
                      {category.recommendations.map((rec) => (
                        <li key={rec.id}>
                          <div>
                            <h5>{rec.recommendationText_et}</h5>
                            <p>{rec.recommendationDescription_et}</p>
                          </div>
                          {rec.providers.length > 0 && (
                            <div>
                              <p>Teenusepakkujad:</p>
                              <div>
                                {rec.providers.map((provider) => (
                                  <a
                                    key={provider.id}
                                    href={provider.providerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Avatar>
                                      <AvatarImage 
                                        src={provider.providerLogo?.[0]?.url} 
                                        alt={provider.providerName_et} 
                                      />
                                      <AvatarFallback>
                                        {provider.providerName_et.substring(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {provider.providerName_et}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    {category.solutions.length > 0 && (
                      <div>
                        <h4>Näidislahendused</h4>
                        <ul>
                          {category.solutions.map((solution) => (
                            <li key={solution.id}>
                              {solution.exampleSolutionText_et}
                              <p>{solution.exampleSolutionDescription_et}</p>
                              {solution.providers.length > 0 && (
                                <div>
                                  <p>Teenusepakkujad:</p>
                                  <div>
                                    {solution.providers.map((provider) => (
                                      <a
                                        key={provider.id}
                                        href={provider.providerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Avatar>
                                          <AvatarImage 
                                            src={provider.providerLogo?.[0]?.url} 
                                            alt={provider.providerName_et} 
                                          />
                                          <AvatarFallback>
                                            {provider.providerName_et.substring(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        {provider.providerName_et}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
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
