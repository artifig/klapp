'use client';

import { ProviderList } from "@/components/assessment/provider-list";
import type { CategoryScore } from "@/lib/types";

interface CategoryDetailsProps {
  category: CategoryScore;
}

export function CategoryDetails({ category }: CategoryDetailsProps) {
  // Helper function to get background color based on maturity level
  const getMaturityColorClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'red': return 'bg-red-100 text-red-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'green': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-xl font-bold text-secondary mb-4">{category.categoryText_et}</h3>
      
      <div className="flex items-center mb-4">
        <span className="text-3xl font-bold text-primary mr-4">{category.score}%</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaturityColorClass(category.maturityLevel)}`}>
          {category.maturityLevel}
        </span>
      </div>
      
      <p className="text-gray-700 mb-6">{category.categoryDescription_et}</p>
      
      <div className="space-y-6">
        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold text-secondary mb-4">Soovitused</h4>
          <ul className="space-y-4">
            {category.recommendations.map((rec) => (
              <li key={rec.id} className="bg-primary/5 p-4 rounded-lg">
                <div className="mb-3">
                  <h5 className="font-semibold text-secondary">{rec.recommendationText_et}</h5>
                  <p className="text-gray-700 mt-1">{rec.recommendationDescription_et}</p>
                </div>
                {rec.providers && rec.providers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h6 className="text-sm font-medium text-gray-600 mb-2">Teenusepakkujad</h6>
                    <ProviderList providers={rec.providers} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {category.solutions && category.solutions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold text-secondary mb-4">Näidislahendused</h4>
            <ul className="space-y-4">
              {category.solutions.map((solution) => (
                <li key={solution.id} className="bg-secondary/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-secondary">{solution.exampleSolutionText_et}</h5>
                  <p className="text-gray-700 mt-1">{solution.exampleSolutionDescription_et}</p>
                  
                  {solution.providers && solution.providers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h6 className="text-sm font-medium text-gray-600 mb-2">Teenusepakkujad</h6>
                      <ProviderList providers={solution.providers} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 