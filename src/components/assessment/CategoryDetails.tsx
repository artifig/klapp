'use client';

import { ProviderList } from "@/components/ui/ProviderList";
import type { CategoryScore } from "@/lib/types";

interface CategoryDetailsProps {
  category: CategoryScore;
}

export function CategoryDetails({ category }: CategoryDetailsProps) {
  return (
    <div>
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
              <ProviderList providers={rec.providers} />
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
                  <ProviderList providers={solution.providers} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 