'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";
import { ResultsChart } from "@/components/assessment/ResultsChart";
import { ProviderList } from "@/components/ui/ProviderList";
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
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-secondary">Teie hinnangu tulemused</h2>
        <div className="mb-6">
          <ResultsChart categories={categories} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-gray-100">
            <CardTitle className="text-xl text-secondary">Teie eesmärk</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-700">{initialGoal || "Eesmärk pole määratud"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-gray-100">
            <CardTitle className="text-xl text-secondary">Üldine tulemus</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-bold text-primary mb-2">{overallScore}%</div>
            <p className="text-gray-600">Teie ettevõtte valmisolek</p>
          </CardContent>
        </Card>

        {topProviders.length > 0 && (
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-gray-100">
              <CardTitle className="text-xl text-secondary">Soovitatud teenusepakkujad</CardTitle>
              <CardDescription className="text-gray-600">
                Teie ettevõtte vajadustele kõige paremini vastavad teenusepakkujad
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ProviderList providers={topProviders} showDescription />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 