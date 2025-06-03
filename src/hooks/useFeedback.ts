import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feedback, FeedbackSummary, FeedbackTrend, FeedbackAnalytics, FeedbackRecommendation, FeedbackSearchResult, FeedbackExport } from '@/types/feedback';
import { ApiError } from '@/lib/errors';

export function useFeedback(agentId: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

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
    mutationFn: async ({ feedbackId, response }: { feedbackId: string; response: string }) => {
      try {
        const response = await fetch(`/api/feedback/${feedbackId}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response })
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
    error
  };
} 