import { getRecommendations, getExampleSolutions } from '@/lib/airtable';
import { InfoSection } from '@/components/InfoSection';

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await and resolve the search params
  const resolvedSearchParams = await searchParams;

  // Get the assessment scores from the URL parameters
  const categoryScores: { [key: string]: number } = {};
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (key.startsWith('category_') && typeof value === 'string') {
      const categoryId = key.replace('category_', '');
      categoryScores[categoryId] = parseFloat(value);
    }
  });

  // Fetch recommendations and example solutions based on scores
  const recommendations = await getRecommendations(categoryScores);
  const exampleSolutions = await getExampleSolutions(categoryScores);

  // Transform recommendations and solutions to match InfoItem interface
  const recommendationItems = recommendations.map(rec => ({
    id: rec.id,
    title: rec.recommendationText_et,
    description: rec.recommendationDescription_et
  }));

  const solutionItems = exampleSolutions.map(solution => ({
    id: solution.id,
    title: solution.exampleSolutionText_et,
    description: solution.exampleSolutionDescription_et
  }));

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="tehnopol-gradient-text text-3xl font-bold mb-6">
        Hindamise tulemused
      </h1>
      
      <InfoSection
        title="Soovitused"
        items={recommendationItems}
        emptyMessage="Soovitusi ei leitud."
      />

      <InfoSection
        title="Näidislahendused"
        items={solutionItems}
        emptyMessage="Näidislahendusi ei leitud."
      />
    </main>
  );
}
