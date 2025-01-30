import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface RadarChartProps {
  data: Array<{
    category: string;
    value: number;
    fullMark: number;
  }>;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <RechartsRadar cx="50%" cy="50%" outerRadius="80%">
        <PolarGrid 
          gridType="circle"
          stroke="#374151"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          stroke="#374151"
        />
        <Radar
          dataKey="value"
          data={data}
          fill="#FF6600"
          fillOpacity={0.2}
          stroke="#FF6600"
          strokeWidth={2}
          animationBegin={0}
          animationDuration={1500}
          animationEasing="ease-out"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
                  <div className="font-medium text-white mb-1">
                    {data.category}
                  </div>
                  <div className="text-sm text-gray-300">
                    Score: {data.value}%
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}; 