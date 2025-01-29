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
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';

// Example data - in production this would come from the assessment results
const data = [
  {
    category: 'Business Model Validation',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Founding Team & Culture',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'Initial Funding',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'MVP Development',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Business Strategy',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Product Development',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'Operations & Infrastructure',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Data & Technology',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'Quality Management',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'Human Capital',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Customer Experience',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Finance & Risk',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'Governance & Compliance',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Stakeholder Engagement',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'Sustainability',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'Health & Safety',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Globalization',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Corporate Governance',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'Strategic Alliances',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'Regulatory Frameworks',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'R&D & Innovation',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'Social Responsibility',
    value: 2,
    fullMark: 3,
  }
];

const recommendations = [
  {
    category: 'Data & Technology',
    level: 'yellow',
    text: 'Implement data quality controls and preprocessing pipelines',
    provider: 'DataAI Solutions',
    offer: 'Free data assessment consultation'
  },
  {
    category: 'R&D & Innovation',
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
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            {t('results.title')}
          </h1>
          <p className="text-gray-400">
            {t('results.summary')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Column - Radar Chart */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t('results.categories')}</CardTitle>
                <CardDescription>Your AI readiness scores across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="58%" data={data}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{
                          fill: '#9CA3AF',
                          fontSize: 8,
                          dy: 3,
                        }}
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

                {/* Download Report Button */}
                <button
                  onClick={() => window.print()}
                  className="w-full mt-6 px-8 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                    shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all text-center"
                >
                  {t('results.downloadReport')}
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t('results.recommendations')}</CardTitle>
                <CardDescription>Actionable steps to improve your AI readiness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-800 rounded-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{rec.category}</h3>
                        <span className={`px-3 py-1 text-sm ${
                          rec.level === 'red' ? 'bg-red-900/50 text-red-200' :
                          rec.level === 'yellow' ? 'bg-yellow-900/50 text-yellow-200' :
                          'bg-green-900/50 text-green-200'
                        }`}>
                          {t(`results.levels.${rec.level}`)}
                        </span>
                      </div>
                      <p className="text-gray-300">{rec.text}</p>
                      <div className="border-t border-gray-800 pt-3">
                        <div className="font-bold text-sm">{rec.provider}</div>
                        <div className="text-orange-500 text-sm">{rec.offer}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Back Button */}
                <Link
                  href={routes.assessment}
                  className="block w-full px-6 py-2 bg-gray-800 text-white font-medium 
                    hover:bg-gray-700 transition-colors text-center mt-6"
                >
                  {t('nav.back')}
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
} 