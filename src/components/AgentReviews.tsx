"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { fetchApi } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
}

interface AgentReviewsProps {
  product_id: string;
}

export function AgentReviews({ product_id }: AgentReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetchApi<ReviewsResponse>(`/api/reviews?product_id=${product_id}`);
      
      if ('data' in response && response.data?.reviews) {
        setReviews(response.data.reviews);
      } else if ('error' in response) {
        setError(response.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product_id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please sign in to submit a review');
      return;
    }

    try {
      const response = await fetchApi('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id,
          rating,
          comment,
        }),
      });

      if ('data' in response) {
        toast.success('Review submitted successfully');
        setRating(0);
        setComment('');
        fetchReviews();
      } else if ('error' in response) {
        toast.error(response.error || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reviews</h2>
      
      {session && (
        <Card className="p-6">
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        value <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Comment</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full"
              />
            </div>
            
            <Button type="submit" disabled={!rating}>
              Submit Review
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                by {review.user.name} on {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
} 