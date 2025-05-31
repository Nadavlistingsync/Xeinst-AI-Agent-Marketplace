import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeedbackResponse } from './FeedbackResponse';
import { formatDistanceToNow } from 'date-fns';
import { Star, TrendingUp, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FeedbackMetrics {
  average_rating: number;
  totalFeedbacks: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  neutralFeedbacks: number;
  sentimentScore: number;
  commonIssues: string[];
  improvementSuggestions: string[];
  categories: {
    [key: string]: number;
  };
  responseMetrics: {
    totalResponses: number;
    averageResponseTime: number;
    responseRate: number;
  };
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  creator_response?: string;
  response_date?: string;
  user: {
    name: string;
    email: string;
  };
}

interface FeedbackDashboardProps {
  agentId: string;
}

export function FeedbackDashboard({ agentId }: FeedbackDashboardProps) {
  const [metrics] = useState<FeedbackMetrics | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/feedback/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div>Loading feedback data...</div>;
  }

  if (!metrics) {
    return <div>No feedback data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.average_rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Based on {metrics.totalFeedbacks} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseMetrics.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.responseMetrics.totalResponses} responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseMetrics.averageResponseTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Time to respond to feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.sentimentScore * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall feedback sentiment
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="unresponded">Unresponded</TabsTrigger>
          <TabsTrigger value="responded">Responded</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id} className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">{feedback.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1">{feedback.rating}</span>
                    </div>
                  </div>
                  <p className="mb-4">{feedback.comment}</p>
                  {feedback.creator_response ? (
                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">Your Response:</p>
                      <p>{feedback.creator_response}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(feedback.response_date || ''), { addSuffix: true })}
                      </p>
                    </div>
                  ) : (
                    <FeedbackResponse
                      feedbackId={feedback.id}
                      onResponseSubmitted={fetchData}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="unresponded" className="space-y-4">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            {feedbacks
              .filter((f) => !f.creator_response)
              .map((feedback) => (
                <Card key={feedback.id} className="mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">{feedback.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1">{feedback.rating}</span>
                      </div>
                    </div>
                    <p className="mb-4">{feedback.comment}</p>
                    <FeedbackResponse
                      feedbackId={feedback.id}
                      onResponseSubmitted={fetchData}
                    />
                  </CardContent>
                </Card>
              ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="responded" className="space-y-4">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            {feedbacks
              .filter((f) => f.creator_response)
              .map((feedback) => (
                <Card key={feedback.id} className="mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">{feedback.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1">{feedback.rating}</span>
                      </div>
                    </div>
                    <p className="mb-4">{feedback.comment}</p>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">Your Response:</p>
                      <p>{feedback.creator_response}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(feedback.response_date || ''), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 