'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryDetails } from "@/components/assessment/category-details";
import type { CategoryScore } from "@/lib/types";

interface DetailedAnalysisProps {
  categoryScores: CategoryScore[];
}

export function DetailedAnalysis({ categoryScores }: DetailedAnalysisProps) {
  return (
    <div className="my-8 text-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md">
            Vaata täielikku analüüsi
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4 mb-6">
            <DialogTitle className="text-2xl font-bold text-secondary">Täielik AI-valmiduse analüüs</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Detailne ülevaade kõikidest valdkondadest koos soovituste ja lahendustega
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            {categoryScores.map((category) => (
              <CategoryDetails key={category.id} category={category} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 