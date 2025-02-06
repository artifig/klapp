import { Card, CardContent } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface CategoryLevel {
    category: {
        id: string;
        text: { et: string; en: string };
    };
    level: {
        levelText_et: string;
        levelScore_upperThreshold: number;
    };
    score: number;
}

interface ResultsVisualizationsProps {
    categoryLevels: CategoryLevel[];
    t: (key: string) => string;
}

const COLORS = ['#2563eb', '#4f46e5', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

export function ResultsVisualizations({ categoryLevels, t }: ResultsVisualizationsProps) {
    // Prepare data for radar chart
    const radarData = categoryLevels.map(({ category, level }) => ({
        subject: category.text.et,
        level: level.levelText_et,
        score: level.levelScore_upperThreshold,
        fullMark: 5
    }));

    // Prepare data for bar chart
    const barData = categoryLevels.map(({ category, score }) => ({
        name: category.text.et,
        score: Math.round(score * 100) / 100
    }));

    // Prepare data for donut chart
    const pieData = categoryLevels.map(({ category, score }) => ({
        name: category.text.et,
        value: score
    }));

    return (
        <div className="space-y-8">
            {/* Radar Chart */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('categoryLevels')}</h3>
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid gridType="circle" />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#2563eb"
                                    fill="#2563eb"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Bar Chart */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('categoryScores')}</h3>
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 5]} />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Donut Chart */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('categoryDistribution')}</h3>
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 