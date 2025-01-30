'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';

// Example data - in production this would come from the assessment results
const data = [
  {
    category: 'businessModel',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'team',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'funding',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'mvp',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'strategy',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'product',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'operations',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'dataTech',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'quality',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'humanCapital',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'customerExp',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'finance',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'governance',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'stakeholders',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'sustainability',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'health',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'globalization',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'corpGov',
    value: 1,
    fullMark: 3,
  },
  {
    category: 'alliances',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'regulatory',
    value: 2,
    fullMark: 3,
  },
  {
    category: 'rnd',
    value: 3,
    fullMark: 3,
  },
  {
    category: 'social',
    value: 2,
    fullMark: 3,
  }
];

type TranslationFunction = ReturnType<typeof useTranslations>;

const recommendations = [
  {
    category: 'dataTech',
    level: 'yellow',
    text: (t: TranslationFunction) => t('results.recommendations.dataTech.text'),
    provider: (t: TranslationFunction) => t('results.recommendations.dataTech.provider'),
    offer: (t: TranslationFunction) => t('results.recommendations.dataTech.offer')
  },
  {
    category: 'rnd',
    level: 'red',
    text: (t: TranslationFunction) => t('results.recommendations.rnd.text'),
    provider: (t: TranslationFunction) => t('results.recommendations.rnd.provider'),
    offer: (t: TranslationFunction) => t('results.recommendations.rnd.offer')
  }
];

export default function ResultsPage() {
  const t = useTranslations();
  const {state} = useAssessment();
  const [email, setEmail] = useState(state.formData.email || '');
  const [editedEmail, setEditedEmail] = useState(email);
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEmail(e.target.value);
  };

  const handleSaveEmail = () => {
    setEmail(editedEmail);
    setIsEditing(false);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    // TODO: Implement email sending logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setIsSending(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download logic
    window.print(); // Temporary using print for now
  };

  return (
    <PageWrapper>
      <div className="h-full grid lg:grid-cols-2 gap-4">
        {/* Left Column - Radar Chart */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-none">
            <CardTitle className="text-4xl">{t('results.title')}</CardTitle>
            <CardDescription className="text-lg">
              {t('results.summary')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{
                      fill: '#9CA3AF',
                      fontSize: 10,
                      dy: 4,
                    }}
                    tickFormatter={(value) => t(`results.categories.${value}`)}
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

            {/* Back Button */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <Link
                href={routes.assessment}
                className="w-full px-6 py-2 bg-gray-800 text-white font-medium 
                  hover:bg-gray-700 transition-colors text-center"
              >
                {t('nav.back')}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Recommendations and Report Actions */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-none">
            <CardTitle>{t('results.recommendations')}</CardTitle>
            <CardDescription>{t('results.actionableSteps')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-800 rounded-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {t(`results.recommendations.${rec.category}.title`)}
                      </h3>
                      <span className={`px-3 py-1 text-sm ${
                        rec.level === 'red' ? 'bg-red-900/50 text-red-200' :
                        rec.level === 'yellow' ? 'bg-yellow-900/50 text-yellow-200' :
                        'bg-green-900/50 text-green-200'
                      }`}>
                        {t(`results.levels.${rec.level}`)}
                      </span>
                    </div>
                    <p className="text-gray-300">{rec.text(t)}</p>
                    <div className="border-t border-gray-800 pt-3">
                      <div className="font-bold text-sm">{rec.provider(t)}</div>
                      <div className="text-orange-500 text-sm">{rec.offer(t)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Actions */}
            <div className="mt-6 space-y-4 border-t border-gray-800 pt-6 flex-none">
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={isEditing ? editedEmail : email}
                  onChange={handleEmailChange}
                  disabled={!isEditing}
                  className={`flex-1 p-2 bg-gray-800/50 border border-gray-700 text-white
                    focus:border-orange-500 focus:ring-1 focus:ring-orange-500
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder={t('results.emailPlaceholder')}
                />
                {isEditing ? (
                  <button
                    onClick={handleSaveEmail}
                    className="secondary-button"
                  >
                    {t('common.save')}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="secondary-button"
                  >
                    {t('results.updateEmail')}
                  </button>
                )}
              </div>
              
              <div className="grid gap-2">
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="primary-button w-full"
                >
                  {isSending ? t('results.sendingEmail') : 
                   showSuccess ? t('results.emailSent') : 
                   t('results.emailReport')}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="secondary-button w-full"
                >
                  {t('results.downloadPDF')}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
} 