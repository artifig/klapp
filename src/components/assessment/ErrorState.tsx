'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";

interface ErrorStateProps {
  title?: string;
  description?: string;
  backLink?: string;
  backText?: string;
}

export function ErrorState({ 
  title = "Viga laadimisel", 
  description = "Kahjuks tekkis viga. Palun proovige uuesti.",
  backLink = "/assessment",
  backText = "Tagasi algusesse"
}: ErrorStateProps) {
  return (
    <main>
      <h1>AI-valmiduse hindamine</h1>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <a href={backLink}>
            {backText}
          </a>
        </CardContent>
      </Card>
    </main>
  );
} 