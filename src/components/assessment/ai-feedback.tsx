'use client';

import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AiFeedbackProps {
  assessmentId: string;
  initialCompanyType: string;
  initialGoal: string;
  overallScore: number;
}

export function AiFeedback({ assessmentId, initialCompanyType, initialGoal, overallScore }: AiFeedbackProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateFeedback = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId,
          companyType: initialCompanyType,
          initialGoal,
          overallScore,
          prompt,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate AI feedback');
      }
      
      const data = await res.json();
      setResponse(data.feedback);
    } catch (err) {
      setError('Vabandust, midagi läks valesti tagasiside genereerimisel. Palun proovige hiljem uuesti.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-gray-100">
        <CardTitle className="text-xl text-secondary">AI abiline</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p className="text-gray-700">
          Küsi meie AI abiliselt personaalset nõu, mis põhineb sinu hindamise tulemustel.
        </p>
        
        <div className="mt-4">
          <Textarea
            placeholder="Küsi midagi... Näiteks: Millised on minu ettevõtte jaoks parimad AI rakendamise võimalused?"
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            className="min-h-[100px] border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={generateFeedback}
            disabled={!prompt.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? <LoadingSpinner /> : 'Genereeri tagasisidet'}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        {response && (
          <div className="mt-6 p-5 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium text-secondary mb-3">AI tagasiside</h3>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {response}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 