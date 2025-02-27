"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis, ResponsiveContainer, Tooltip, TooltipProps } from "recharts"

interface CategoryScore {
  name: string;
  level: 'red' | 'yellow' | 'green';
  value: number;
}

// Map category levels to colors for visual representation
const levelToColor = {
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
};

interface ResultsChartProps {
  categories: CategoryScore[];
}

interface ChartDataPoint {
  category: string;
  value: number;
  actualValue: number;
  fill: string;
}

// Custom tooltip for the radar chart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    return (
      <div className="bg-card border rounded shadow-sm p-2 text-sm">
        <p className="font-medium">{data.category}</p>
        <p className="text-muted-foreground">Tulemus: {data.actualValue}%</p>
      </div>
    );
  }
  return null;
};

export function ResultsChart({ categories }: ResultsChartProps) {
  // Use actual values but add level color for visual representation
  const chartData = categories.map(cat => ({
    category: cat.name,
    value: cat.value,
    actualValue: cat.value,
    fill: levelToColor[cat.level],
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius="80%" 
          data={chartData}
          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
        >
          <PolarGrid 
            stroke="var(--border)"
            strokeDasharray="3 3"
            gridType="circle"
          />
          <PolarAngleAxis 
            dataKey="category"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tickCount={5}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            angle={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Tase"
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
} 