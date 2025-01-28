'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

// Example data - in production this would come from the assessment results
const data = [
  {
    category: 'Data Management',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Process Automation',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'AI Readiness',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Infrastructure',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'Skills & Training',
    value: 1,
    fullMark: 3,
  },
];

const recommendations = [
  {
    category: 'Data Management',
    level: 'yellow',
    text: 'Consider implementing automated data collection systems',
    provider: 'DataCo Solutions',
    offer: 'Free initial consultation'
  },
  {
    category: 'Process Automation',
    level: 'red',
    text: 'Start with basic process automation tools',
    provider: 'AutomatePro',
    offer: '30-day free trial'
  }
];

export default function ResultsPage() {
  const t = useTranslations();

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {t('results.title')}
          </h1>
          <p className="text-xl text-gray-300">
            {t('results.summary')}
          </p>
        </div>

        {/* Radar Chart */}
        <div className="bg-gray-900 p-8 rounded-none">
          <h2 className="text-2xl font-bold mb-6">
            {t('results.categories')}
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#4B5563" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{fill: '#9CA3AF', fontSize: 12}}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#F97316"
                  fill="#F97316"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">
            {t('results.recommendations')}
          </h2>
          
          <div className="grid gap-6">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    {rec.category}
                  </h3>
                  <span className={`px-3 py-1 text-sm ${
                    rec.level === 'red' ? 'bg-red-900/50 text-red-200' :
                    rec.level === 'yellow' ? 'bg-yellow-900/50 text-yellow-200' :
                    'bg-green-900/50 text-green-200'
                  }`}>
                    {t(`results.levels.${rec.level}`)}
                  </span>
                </div>
                <p className="text-gray-300">
                  {rec.text}
                </p>
                <div className="border-t border-gray-700 pt-4">
                  <div className="font-bold">{rec.provider}</div>
                  <div className="text-orange-500">{rec.offer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Link
            href={routes.assessment}
            className="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"
          >
            {t('nav.back')}
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
          >
            {t('results.downloadReport')}
          </button>
        </div>
      </div>
    </main>
  );
} 