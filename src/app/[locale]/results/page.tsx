'use client';

import { useTranslations } from 'next-intl';
import { useAssessment } from '@/context/AssessmentContext';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { RadarChart } from '@/components/ui/RadarChart';
import { RecommendationCard } from '@/components/ui/RecommendationCard';
import { generatePDF } from '@/utils/pdfGenerator';
import { useState } from 'react';
import { Download, Mail, Loader2 } from 'lucide-react';

export default function ResultsPage() {
  const t = useTranslations();
  const { state } = useAssessment();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(state.formData?.email || '');

  // Transform assessment data for radar chart
  const chartData = Object.entries(state.results || {}).map(([category, score]) => ({
    category: t(`results.categories.${category}`),
    value: score as number,
    fullMark: 100
  }));

  // Group recommendations by priority
  const recommendations = Object.entries(state.recommendations || {}).reduce((acc, [category, rec]) => {
    const priority = (rec as { score: number }).score < 33 ? 'high' : (rec as { score: number }).score < 66 ? 'medium' : 'low';
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push({
      ...(rec as {
        title: string;
        text: string;
        score: number;
        provider: string;
        offer: string;
      }),
      category,
      progress: Math.round(Math.random() * 100) // Replace with actual progress tracking
    });
    return acc;
  }, {} as Record<'high' | 'medium' | 'low', Array<{
    title: string;
    text: string;
    score: number;
    provider: string;
    offer: string;
    category: string;
    progress: number;
  }>>);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfData = {
        companyName: state.formData?.company || '',
        contactName: state.formData?.name || '',
        email: state.formData?.email || '',
        date: new Date().toLocaleDateString('et-EE'),
        scores: chartData.map(item => ({
          category: item.category,
          score: item.value
        })),
        recommendations: Object.values(state.recommendations || {}).map(rec => ({
          title: (rec as { title: string }).title,
          text: (rec as { text: string }).text,
          priority: (rec as { score: number }).score < 33 ? 'Kõrge' : (rec as { score: number }).score < 66 ? 'Keskmine' : 'Madal',
          provider: (rec as { provider: string }).provider,
          offer: (rec as { offer: string }).offer
        }))
      };

      const doc = generatePDF(pdfData);
      doc.save('tehisaru-valmisolek.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    // Implement email sending logic here
    await new Promise(resolve => setTimeout(resolve, 1500)); // Mock API call
    setIsSendingEmail(false);
  };

  return (
    <PageWrapper>
      <div className="h-full flex flex-col">
        <div className="flex-1 grid lg:grid-cols-2 gap-6">
          {/* Left Column - Radar Chart */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>{t('results.title')}</CardTitle>
              <CardDescription>{t('results.summary')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full min-h-[500px]">
                <RadarChart data={chartData} />
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Actions and Export */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>{t('results.recommendationsTitle')}</CardTitle>
              <CardDescription>{t('results.actionableSteps')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-6">
                {/* Email Report */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    {t('results.emailPlaceholder')}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="input-field flex-1"
                      placeholder="email@example.com"
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={isSendingEmail || !emailInput}
                      className="secondary-button flex items-center gap-2 whitespace-nowrap"
                    >
                      {isSendingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      {t('results.emailReport')}
                    </button>
                  </div>
                </div>

                {/* Download PDF */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="primary-button w-full flex items-center justify-center gap-2"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {t('results.downloadPDF')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Section */}
        <div className="mt-6 space-y-6">
          {/* High Priority */}
          {recommendations.high?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Kõrge prioriteediga soovitused
              </h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {recommendations.high.map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    title={rec.title}
                    text={rec.text}
                    provider={rec.provider}
                    offer={rec.offer}
                    priority="high"
                    progress={rec.progress}
                    onAction={() => window.open('https://tehisaru.ee', '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {recommendations.medium?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                Keskmise prioriteediga soovitused
              </h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {recommendations.medium.map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    title={rec.title}
                    text={rec.text}
                    provider={rec.provider}
                    offer={rec.offer}
                    priority="medium"
                    progress={rec.progress}
                    onAction={() => window.open('https://tehisaru.ee', '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {recommendations.low?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Madala prioriteediga soovitused
              </h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {recommendations.low.map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    title={rec.title}
                    text={rec.text}
                    provider={rec.provider}
                    offer={rec.offer}
                    priority="low"
                    progress={rec.progress}
                    onAction={() => window.open('https://tehisaru.ee', '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 