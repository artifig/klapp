"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface CategoryScore {
  name: string;
  level: 'red' | 'yellow' | 'green';
  value: number;
}

const levelToValue = {
  red: 33,
  yellow: 66,
  green: 100,
};

interface ResultsChartProps {
  categories: CategoryScore[];
}

export function ResultsChart({ categories }: ResultsChartProps) {
  const chartData = categories.map(cat => ({
    category: cat.name,
    value: levelToValue[cat.level],
  }));

  return (
    <Card>
      <CardContent>
        <div>
          <RadarChart width={400} height={300} data={chartData}>
            <PolarGrid 
              gridType="circle"
              radialLines={false}
              polarRadius={[33, 66, 100]}
            />
            <PolarAngleAxis
              dataKey="category"
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={4}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Maturity Level"
              dataKey="value"
            />
          </RadarChart>
        </div>
      </CardContent>
    </Card>
  );
} 