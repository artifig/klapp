'use client';

import { useState } from "react";
import { ProviderList } from "@/components/ui/ProviderList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CategoryScore } from "@/lib/types";

interface CategoryDetailsProps {
  category: CategoryScore;
}

export function CategoryDetails({ category }: CategoryDetailsProps) {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);

  // Get the appropriate color based on maturity level
  const getMaturityColor = (level: string) => {
    switch(level) {
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{category.categoryText_et}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">{category.score}%</span>
            <span className={`px-2 py-1 text-sm rounded border ${getMaturityColor(category.maturityColor)}`}>
              {category.maturityLevel}
            </span>
          </div>
        </div>
        <CardDescription>{category.categoryDescription_et}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-lg font-medium mb-2">Soovitused</h4>
          <div className="space-y-3">
            {category.recommendations.map((rec) => (
              <Card key={rec.id} className="overflow-hidden border">
                <div 
                  className="p-3 cursor-pointer hover:bg-accent/50" 
                  onClick={() => setExpandedRecommendation(
                    expandedRecommendation === rec.id ? null : rec.id
                  )}
                >
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">{rec.recommendationText_et}</h5>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      {expandedRecommendation === rec.id ? '−' : '+'}
                    </Button>
                  </div>
                </div>
                
                {expandedRecommendation === rec.id && (
                  <div className="px-3 pb-3 pt-0 border-t">
                    <p className="text-sm text-muted-foreground mb-3">{rec.recommendationDescription_et}</p>
                    {rec.providers.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium mb-2">Teenusepakkujad</h6>
                        <ProviderList providers={rec.providers} />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {category.solutions.length > 0 && (
          <div>
            <h4 className="text-lg font-medium mb-2">Näidislahendused</h4>
            <div className="space-y-3">
              {category.solutions.map((solution) => (
                <Card key={solution.id} className="overflow-hidden border">
                  <div 
                    className="p-3 cursor-pointer hover:bg-accent/50"
                    onClick={() => setExpandedSolution(
                      expandedSolution === solution.id ? null : solution.id
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">{solution.exampleSolutionText_et}</h5>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        {expandedSolution === solution.id ? '−' : '+'}
                      </Button>
                    </div>
                  </div>
                  
                  {expandedSolution === solution.id && (
                    <div className="px-3 pb-3 pt-0 border-t">
                      <p className="text-sm text-muted-foreground mb-3">{solution.exampleSolutionDescription_et}</p>
                      {solution.providers.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium mb-2">Teenusepakkujad</h6>
                          <ProviderList providers={solution.providers} />
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 