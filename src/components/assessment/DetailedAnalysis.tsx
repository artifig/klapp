'use client';

import { Button } from "@/components/ui/UiButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/UiDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/UiAvatar";
import type { CategoryScore } from "@/lib/types";

interface DetailedAnalysisProps {
  categoryScores: CategoryScore[];
}

export function DetailedAnalysis({ categoryScores }: DetailedAnalysisProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          Vaata täielikku analüüsi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Täielik AI-valmiduse analüüs</DialogTitle>
          <DialogDescription>
            Detailne ülevaade kõikidest valdkondadest koos soovituste ja lahendustega
          </DialogDescription>
        </DialogHeader>
        <div>
          {categoryScores.map((category) => (
            <div key={category.id}>
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
                      {rec.providers.length > 0 && (
                        <div>
                          <p>Teenusepakkujad:</p>
                          <div>
                            {rec.providers.map((provider) => (
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
                                {provider.providerName_et}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
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
                          {solution.providers.length > 0 && (
                            <div>
                              <p>Teenusepakkujad:</p>
                              <div>
                                {solution.providers.map((provider) => (
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
                                    {provider.providerName_et}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 