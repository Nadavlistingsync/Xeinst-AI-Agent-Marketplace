import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface FeedbackTrend {
  date: string;
  average_rating: number;
  feedbackCount: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface FeedbackAnalyticsProps {
  agentId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function FeedbackAnalytics({ agentId }: FeedbackAnalyticsProps) {
  const [trends, setTrends] = useState<FeedbackTrend[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/feedback/analytics/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback analytics');
      }
      const data = await response.json();
      setTrends(data.trends);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      toast.error('Failed to load feedback analytics');
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div>Loading analytics data...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Rating Trends</TabsTrigger>
          <TabsTrigger value="categories">Feedback Categories</TabsTrigger>
          <TabsTrigger value="volume">Feedback Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Rating Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => formatDistanceToNow(new Date(date), { addSuffix: true })}
                    />
                    <YAxis domain={[0, 5]} />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => [value.toFixed(1), 'Rating']}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageRating"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Categories Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value.toFixed(1), 'Score']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => formatDistanceToNow(new Date(date), { addSuffix: true })}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => [value, 'Feedbacks']}
                    />
                    <Bar dataKey="feedbackCount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {trends.length > 0 && (
                <li className="text-sm">
                  <span className="font-medium">Trend: </span>
                  {trends[trends.length - 1].average_rating > trends[0].average_rating
                    ? 'Ratings are improving'
                    : 'Ratings are declining'}
                </li>
              )}
              {categories.length > 0 && (
                <li className="text-sm">
                  <span className="font-medium">Top Category: </span>
                  {categories[0].name}
                </li>
              )}
              {trends.length > 0 && (
                <li className="text-sm">
                  <span className="font-medium">Feedback Volume: </span>
                  {trends.reduce((acc, curr) => acc + curr.feedbackCount, 0)} total feedbacks
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {categories.length > 0 && categories[0].value > 3 && (
                <li className="text-sm">
                  Focus on improving {categories[0].name.toLowerCase()} as it's the most mentioned category
                </li>
              )}
              {trends.length > 0 && trends[trends.length - 1].average_rating < 4 && (
                <li className="text-sm">
                  Consider addressing recent negative feedback to improve ratings
                </li>
              )}
              {trends.length > 0 && trends[trends.length - 1].feedbackCount < 5 && (
                <li className="text-sm">
                  Encourage more users to provide feedback for better insights
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 