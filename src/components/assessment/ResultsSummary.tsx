'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ResultsChart } from "@/components/assessment/ResultsChart";
import { ProviderList } from "@/components/ui/ProviderList";
import { Button } from "@/components/ui/Button";
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Teie AI-valmiduse tulemused</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Üldine tulemus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-4xl font-bold">{overallScore}%</div>
              <p className="text-center text-muted-foreground">Teie ettevõtte AI-valmisolek</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Teie eesmärk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{initialGoal}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Valdkondlik valmisolek</CardTitle>
            <CardDescription>Teie ettevõtte valmisolek erinevates valdkondades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResultsChart categories={categories} />
            </div>
          </CardContent>
        </Card>
        
        {topProviders.length > 0 && (
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Soovitatud teenusepakkujad</CardTitle>
              <CardDescription className="text-xs">
                Teie vajadustele sobivad teenusepakkujad
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <ProviderList providers={topProviders} showDescription={false} />
              <Button variant="outline" size="sm" className="w-full mt-4">
                Vaata kõiki pakkujaid
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 