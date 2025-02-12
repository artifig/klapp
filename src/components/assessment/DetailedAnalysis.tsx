'use client';

import { Button } from "@/components/ui/UiButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/UiDialog";
import { CategoryDetails } from "@/components/assessment/CategoryDetails";
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
            <CategoryDetails key={category.id} category={category} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 