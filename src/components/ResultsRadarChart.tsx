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

interface ResultsRadarChartProps {
  categories: CategoryScore[];
}

export function ResultsRadarChart({ categories }: ResultsRadarChartProps) {
  const chartData = categories.map(cat => ({
    category: cat.name,
    value: levelToValue[cat.level],
  }));

  return (
    <Card className="w-full h-[350px]">
      <CardContent className="p-4 h-full">
        <div className="w-full h-full flex items-center justify-center">
          <RadarChart width={400} height={300} data={chartData}>
            <PolarGrid 
              gridType="circle"
              radialLines={false}
              polarRadius={[33, 66, 100]}
              stroke="#ddd"
              strokeWidth={0.5}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ 
                fontSize: 8,
                fill: '#666',
                dy: 3
              }}
              tickLine={{ stroke: '#ddd', strokeWidth: 0.5 }}
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
              stroke="#FF6600"
              fill="#FF6600"
              fillOpacity={0.5}
            />
          </RadarChart>
        </div>
      </CardContent>
    </Card>
  );
} 