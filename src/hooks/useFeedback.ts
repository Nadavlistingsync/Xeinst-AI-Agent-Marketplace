import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Feedback, FeedbackSummary, FeedbackTrend, FeedbackAnalytics, FeedbackRecommendation, FeedbackSearchResult, FeedbackExport, UpdateFeedbackInput } from '../types/feedback';
import { ApiError } from '../lib/errors';
import { toast } from 'react-hot-toast';

export function useFeedback(agentId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: feedbacks, isLoading: isLoadingFeedbacks } = useQuery<Feedback[]>({
    queryKey: ['feedbacks', agentId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/feedback/${agentId}`);
        if (!response.ok) {
          const error = await response.json();
          throw new ApiError(error.message || 'Failed to fetch feedbacks');
        }
        return response.json();
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch feedbacks'));
        throw error;
      }
    }
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery<FeedbackSummary>({
    queryKey: ['feedback-summary', agentId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/feedback/${agentId}/summary`);
        if (!response.ok) {
          const error = await response.json();
          throw new ApiError(error.message || 'Failed to fetch feedback summary');
        }
        return response.json();
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch feedback summary'));
        throw error;
      }
    }
  });

  const { data: trends, isLoading: isLoadingTrends } = useQuery<FeedbackTrend[]>({
    queryKey: ['feedback-trends', agentId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/feedback/${agentId}/trends`);
        if (!response.ok) {
          const error = await response.json();
          throw new ApiError(error.message || 'Failed to fetch feedback trends');
        }
        return response.json();
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch feedback trends'));
        throw error;
      }
    }
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<FeedbackAnalytics>({
    queryKey: ['feedback-analytics', agentId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/feedback/${agentId}/analytics`);
        if (!response.ok) {
          const error = await response.json();
          throw new ApiError(error.message || 'Failed to fetch feedback analytics');
        }
        return response.json();
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch feedback analytics'));
        throw error;
      }
    }
  });

  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<FeedbackRecommendation[]>({
    queryKey: ['feedback-recommendations', agentId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/feedback/${agentId}/recommendations`);
        if (!response.ok) {
          const error = await response.json();
          throw new ApiError(error.message || 'Failed to fetch feedback recommendations');
        }
        return response.json();
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch feedback recommendations'));
        throw error;
      }
    }
  });

  const searchFeedbacks = async (query: string, page: number = 1, limit: number = 10): Promise<FeedbackSearchResult> => {
    try {
      const response = await fetch(`/api/feedback/${agentId}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.message || 'Failed to search feedbacks');
      }
      return response.json();
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to search feedbacks'));
      throw error;
    }
  };

  const exportFeedbacks = async (format: 'json' | 'csv' = 'json', startDate?: Date, endDate?: Date): Promise<FeedbackExport[]> => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/feedback/${agentId}/export?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.message || 'Failed to export feedbacks');
      }
      return response.json();
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to export feedbacks'));
      throw error;
    }
  };

  const respondToFeedback = useMutation({
    mutationFn: async ({ feedbackId, responseText }: { feedbackId: string; responseText: string }) => {
      try {
        const response = await fetch(`/api/feedback/${feedbackId}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: responseText })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new ApiError(error.message || 'Failed to respond to feedback');
        }
        return response.json();
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to respond to feedback'));
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', agentId] });
      queryClient.invalidateQueries({ queryKey: ['feedback-summary', agentId] });
    }
  });

  const createQueryString = useCallback((params: Record<string, string>) => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value);
        }
      });
      return searchParams.toString();
    } catch (error) {
      console.error('Error creating query string:', error);
      return '';
    }
  }, []);

  const submitFeedback = useCallback(async (feedbackData: {
    content: string;
    rating: number;
    category?: string;
    tags?: string[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedbackData,
          agentId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const responseData = await response.json();
      router.refresh();
      return responseData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, agentId]);

  const updateFeedback = async (id: string, input: UpdateFeedbackInput): Promise<Feedback | null> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }

      const data = await response.json();
      toast.success('Feedback updated successfully');
      return data;
    } catch (error) {
      toast.error('Failed to update feedback');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFeedback = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }

      toast.success('Feedback deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete feedback');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    feedbacks,
    summary,
    trends,
    analytics,
    recommendations,
    isLoadingFeedbacks,
    isLoadingSummary,
    isLoadingTrends,
    isLoadingAnalytics,
    isLoadingRecommendations,
    searchFeedbacks,
    exportFeedbacks,
    respondToFeedback,
    error,
    isLoading,
    submitFeedback,
    createQueryString,
    updateFeedback,
    deleteFeedback,
  };
} 