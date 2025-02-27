'use client';

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { CategoryDetails } from "@/components/assessment/CategoryDetails";
import type { CategoryScore } from "@/lib/types";

interface DetailedAnalysisProps {
  categoryScores: CategoryScore[];
}

export function DetailedAnalysis({ categoryScores }: DetailedAnalysisProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categoryScores.length > 0 ? categoryScores[0].id : null
  );

  // Get maturity color class based on category color
  const getMaturityColorClass = (color: string) => {
    switch(color) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          Vaata täielikku analüüsi
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Täielik AI-valmiduse analüüs</DialogTitle>
          <DialogDescription>
            Detailne ülevaade kõikidest valdkondadest koos soovituste ja lahendustega
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-full overflow-hidden">
          {/* Category tabs */}
          <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
            {categoryScores.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.id)}
                className="whitespace-nowrap"
              >
                {category.categoryText_et}
                <span className={`ml-2 w-2 h-2 rounded-full ${getMaturityColorClass(category.maturityColor)}`} />
              </Button>
            ))}
          </div>
          
          {/* Category content */}
          <div className="overflow-y-auto pb-4 pr-2">
            {categoryScores.map((category) => (
              <div 
                key={category.id} 
                className={selectedCategoryId === category.id ? "block" : "hidden"}
              >
                <CategoryDetails category={category} />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 