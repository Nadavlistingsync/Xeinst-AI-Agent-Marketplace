'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Star, TrendingUp, TrendingDown, MessageSquare, AlertTriangle, ThumbsUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackMetrics {
  average_rating: number;
  totalFeedbacks: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  neutralFeedbacks: number;
  sentimentScore: number;
  commonIssues: string[];
  improvementSuggestions: string[];
}

interface FeedbackTrend {
  date: string;
  average_rating: number;
  feedbackCount: number;
  sentimentScore: number;
}

interface CategoryTrend {
  date: string;
  categories: { [key: string]: number };
}

interface FeedbackInsights {
  topIssues: string[];
  improvementAreas: string[];
  sentimentSummary: {
    overall: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}

interface FeedbackAnalysisProps {
  agentId: string;
}

export function FeedbackAnalysis({ agentId }: FeedbackAnalysisProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [trends, setTrends] = useState<FeedbackTrend[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [insights, setInsights] = useState<FeedbackInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackAnalysis = async () => {
      try {
        const [analysisRes, insightsRes] = await Promise.all([
          fetch(`/api/agents/${agentId}/feedback-analysis`),
          fetch(`/api/agents/${agentId}/feedback-insights`),
        ]);

        if (!analysisRes.ok || !insightsRes.ok) {
          throw new Error('Failed to fetch feedback analysis');
        }

        const [analysisData, insightsData] = await Promise.all([
          analysisRes.json(),
          insightsRes.json(),
        ]);

        setMetrics(analysisData.metrics);
        setTrends(analysisData.trends);
        setCategoryTrends(insightsData.trends.categoryTrend);
        setInsights(insightsData.insights);
      } catch (error) {
        console.error('Error fetching feedback analysis:', error);
        toast({ description: 'Failed to load feedback analysis', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackAnalysis();
  }, [agentId, toast]);

  if (loading) {
    return <div>Loading feedback analysis...</div>;
  }

  if (!metrics || !insights) {
    return <div>No feedback data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.average_rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalFeedbacks} total feedbacks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
            {insights.sentimentSummary.trend === 'improving' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : insights.sentimentSummary.trend === 'declining' ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <ThumbsUp className="h-4 w-4 text-blue-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(insights.sentimentSummary.overall * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.sentimentSummary.trend} trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {insights.topIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {insights.improvementAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating & Sentiment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => formatDistanceToNow(new Date(date), { addSuffix: true })}
                  />
                  <YAxis yAxisId="left" domain={[0, 5]} />
                  <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number, name: string) => [
                      name === 'Average Rating' ? value.toFixed(1) : (value * 100).toFixed(0) + '%',
                      name,
                    ]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="averageRating"
                    stroke="#8884d8"
                    name="Average Rating"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sentimentScore"
                    stroke="#82ca9d"
                    name="Sentiment Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => formatDistanceToNow(new Date(date), { addSuffix: true })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [value.toFixed(1), 'Score']}
                  />
                  {Object.keys(categoryTrends[0]?.categories || {}).map((category, index) => (
                    <Bar
                      key={category}
                      dataKey={`categories.${category}`}
                      name={category}
                      fill={`hsl(${(index * 360) / Object.keys(categoryTrends[0]?.categories || {}).length}, 70%, 50%)`}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 