import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FeedbackMetrics {
  averageRating: number;
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
  averageRating: number;
  feedbackCount: number;
}

interface FeedbackAnalysisProps {
  agentId: string;
}

export function FeedbackAnalysis({ agentId }: FeedbackAnalysisProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [trends, setTrends] = useState<FeedbackTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackAnalysis = async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}/feedback-analysis`);
        if (!response.ok) {
          throw new Error('Failed to fetch feedback analysis');
        }

        const data = await response.json();
        setMetrics(data.metrics);
        setTrends(data.trends);
      } catch (error) {
        console.error('Error fetching feedback analysis:', error);
        toast({
          title: 'Error',
          description: 'Failed to load feedback analysis',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackAnalysis();
  }, [agentId, toast]);

  if (loading) {
    return <div>Loading feedback analysis...</div>;
  }

  if (!metrics) {
    return <div>No feedback data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Based on {metrics.totalFeedbacks} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            {metrics.sentimentScore >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.sentimentScore * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.positiveFeedbacks} positive, {metrics.negativeFeedbacks} negative
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Common Issues</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.commonIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              Issues reported by users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.improvementSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">
              Improvement suggestions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rating Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" domain={[0, 5]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
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
                  dataKey="feedbackCount"
                  stroke="#82ca9d"
                  name="Feedback Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {metrics.commonIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {metrics.commonIssues.map((issue, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {metrics.improvementSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {metrics.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 