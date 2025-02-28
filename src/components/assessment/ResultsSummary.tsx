'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResultsChart } from "@/components/assessment/ResultsChart";
import { ProviderList } from "@/components/assessment/ProviderList";
import type { SolutionProvider } from "@/lib/airtable";

interface ResultsSummaryProps {
  initialGoal: string;
  overallScore: number;
  categories: Array<{
    name: string;
    level: 'red' | 'yellow' | 'green';
    value: number;
  }>;
  topProviders: SolutionProvider[];
}

export function ResultsSummary({ 
  initialGoal, 
  overallScore, 
  categories,
  topProviders 
}: ResultsSummaryProps) {
  return (
    <div>
      <div>
        <ResultsChart categories={categories} />
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Teie eesmärk</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{initialGoal}</p>
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
              <ProviderList providers={topProviders} showDescription />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 