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
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/Card';

// Example data - in production this would come from the assessment results
const data = [
  {
    category: 'Data Quality',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'AI Expertise',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'Infrastructure',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'AI Strategy',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'Ethics & Governance',
    value: 1,
    fullMark: 3,
  },
];

const recommendations = [
  {
    category: 'Data Quality',
    level: 'yellow',
    text: 'Implement data quality controls and preprocessing pipelines',
    provider: 'DataAI Solutions',
    offer: 'Free data assessment consultation'
  },
  {
    category: 'AI Expertise',
    level: 'red',
    text: 'Consider hiring AI specialists or training existing staff',
    provider: 'AI Academy',
    offer: '3-month AI fundamentals course'
  }
];

export default function ResultsPage() {
  const t = useTranslations();

  return (
    <PageWrapper>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Page Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            {t('results.title')}
          </h1>
          <p className="text-gray-400">
            {t('results.summary')}
          </p>
        </div>

        {/* Main Content Card - Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('results.categories')}</CardTitle>
            <CardDescription>Your AI readiness scores across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#374151" />
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
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">
            {t('results.recommendations')}
          </h2>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{rec.category}</CardTitle>
                    <span className={`px-3 py-1 text-sm ${
                      rec.level === 'red' ? 'bg-red-900/50 text-red-200' :
                      rec.level === 'yellow' ? 'bg-yellow-900/50 text-yellow-200' :
                      'bg-green-900/50 text-green-200'
                    }`}>
                      {t(`results.levels.${rec.level}`)}
                    </span>
                  </div>
                  <CardDescription>{rec.text}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="font-bold">{rec.provider}</div>
                    <div className="text-orange-500">{rec.offer}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions Card */}
        <Card>
          <CardContent className="flex justify-between py-4">
            <Link
              href={routes.assessment}
              className="px-6 py-2 bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
            >
              {t('nav.back')}
            </Link>
            <button
              onClick={() => window.print()}
              className="px-8 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
            >
              {t('results.downloadReport')}
            </button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
} 