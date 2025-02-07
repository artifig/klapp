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
import Image from "next/image";

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
      <main>
        <h1>AI-valmiduse hindamine</h1>
        <p className="intro-text">
          Täname teid hindamise läbimise eest! Allpool leiate üksikasjaliku ülevaate tulemustest.
        </p>
        
        <div className="category-section">
          <h2>Teie eesmärk</h2>
          <p>{assessment.initialGoal}</p>
        </div>

        <div className="category-section">
          <h2>Üldine tulemus</h2>
          <p>Teie ettevõtte üldine küpsustase</p>
          <div className="score-indicator">75%</div>
          <p>Küpsustase</p>
        </div>

        <div className="category-section">
          <h2>Tagasiside tehisaru analüüsist</h2>
          <p>
            Teie ettevõte näitab tugevat potentsiaali mitmes valdkonnas. Eriti silmapaistev on teie sooritus kvaliteedijuhtimise ja innovatsiooni valdkonnas. Siiski on mõned võimalused edasisteks parandusteks, eriti seoses digitaliseerimise ja andmepõhise otsustamisega.
          </p>
          
          <h3>Peamised tugevused</h3>
          <ul>
            <li>Tugev strateegiline planeerimine</li>
            <li>Efektiivne meeskonnatöö</li>
            <li>Kliendikeskne lähenemine</li>
          </ul>
          
          <h3>Arendamist vajavad valdkonnad</h3>
          <ul>
            <li>Digitaalsete lahenduste integreerimine</li>
            <li>Andmepõhine otsustusprotsess</li>
            <li>Automatiseerimine ja protsesside optimeerimine</li>
          </ul>
          
          <p className="note">
            * See tagasiside on genereeritud tehisintellekti poolt, põhinedes teie vastustel hindamisküsimustele.
          </p>
        </div>

        {categoryScores.map((category: CategoryScore) => (
          <section key={category.id} className="category-section">
            <h2>{category.categoryText_et}</h2>
            <p>{category.categoryDescription_et}</p>
            
            <div className="score-indicator">{category.score}%</div>
            <p>Vastatud: {category.answeredCount}/{category.questionCount}</p>
            <p>Küpsustase: {category.maturityLevel}</p>

            <div className="progress-bar">
              <div
                className="progress-indicator"
                style={{ width: `${category.score}%` }}
              />
            </div>

            <h3>Soovitused</h3>
            {category.recommendations.map((recommendation) => (
              <article key={recommendation.id} className="question-section">
                <h4>{recommendation.recommendationText_et}</h4>
                <p>{recommendation.recommendationDescription_et}</p>
                {recommendation.providers.length > 0 && (
                  <>
                    <h5>Teenusepakkujad</h5>
                    <div className="providers-grid">
                      {recommendation.providers.map((provider) => (
                        <div key={provider.id} className="provider-card">
                          {provider.providerLogo?.[0] && (
                            <Image
                              src={provider.providerLogo[0].thumbnails.small.url}
                              alt={provider.providerName_et}
                              width={provider.providerLogo[0].thumbnails.small.width}
                              height={provider.providerLogo[0].thumbnails.small.height}
                            />
                          )}
                          <h6>{provider.providerName_et}</h6>
                          <p>{provider.providerDescription_et}</p>
                          <a
                            href={provider.providerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Külasta veebilehte
                          </a>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </article>
            ))}

            <h3>Näidislahendused</h3>
            {category.solutions.map((solution) => (
              <article key={solution.id} className="question-section">
                <h4>{solution.exampleSolutionText_et}</h4>
                <p>{solution.exampleSolutionDescription_et}</p>
                {solution.providers.length > 0 && (
                  <>
                    <h5>Teenusepakkujad</h5>
                    <div className="providers-grid">
                      {solution.providers.map((provider) => (
                        <div key={provider.id} className="provider-card">
                          {provider.providerLogo?.[0] && (
                            <Image
                              src={provider.providerLogo[0].thumbnails.small.url}
                              alt={provider.providerName_et}
                              width={provider.providerLogo[0].thumbnails.small.width}
                              height={provider.providerLogo[0].thumbnails.small.height}
                            />
                          )}
                          <h6>{provider.providerName_et}</h6>
                          <p>{provider.providerDescription_et}</p>
                          <a
                            href={provider.providerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Külasta veebilehte
                          </a>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </article>
            ))}
          </section>
        ))}
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
