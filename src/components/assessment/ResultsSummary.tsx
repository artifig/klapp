'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";
import { ResultsChart } from "@/components/assessment/ResultsChart";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/UiAvatar";
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
  );
} 