import { getRecommendations, getExampleSolutions } from '@/lib/airtable';

export default async function ResultsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get the assessment scores from the URL parameters
  const categoryScores: { [key: string]: number } = {};
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key.startsWith('category_') && typeof value === 'string') {
      const categoryId = key.replace('category_', '');
      categoryScores[categoryId] = parseFloat(value);
    }
  });

  // Fetch recommendations and example solutions based on scores
  const recommendations = await getRecommendations(categoryScores);
  const exampleSolutions = await getExampleSolutions(categoryScores);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Hindamise tulemused
      </h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Soovitused</h2>
        {recommendations.length > 0 ? (
          <ul className="space-y-4">
            {recommendations.map(rec => (
              <li key={rec.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">{rec.recommendationText_et}</h3>
                <p className="text-gray-600 mt-2">{rec.recommendationDescription_et}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Soovitusi ei leitud.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Näidislahendused</h2>
        {exampleSolutions.length > 0 ? (
          <ul className="space-y-4">
            {exampleSolutions.map(solution => (
              <li key={solution.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">{solution.exampleSolutionText_et}</h3>
                <p className="text-gray-600 mt-2">{solution.exampleSolutionDescription_et}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Näidislahendusi ei leitud.</p>
        )}
      </section>
    </main>
  );
}
