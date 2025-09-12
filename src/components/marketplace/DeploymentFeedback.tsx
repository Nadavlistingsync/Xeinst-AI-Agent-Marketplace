'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useReviews } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";

interface DeploymentFeedbackProps {
  deploymentId: string;
}

export function DeploymentFeedback({ deploymentId }: DeploymentFeedbackProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { reviews, isLoading, fetchReviews, createReview, updateReview, deleteReview } = useReviews({ deploymentId });

  useEffect(() => {
    fetchReviews();
  }, [deploymentId, fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (rating < 1 || rating > 5) return;

    await createReview(rating, comment);
    setRating(0);
    setComment("");
  };

  const handleUpdate = async (reviewId: string, newRating: number, newComment: string) => {
    await updateReview(reviewId, newRating, newComment);
  };

  const handleDelete = async (reviewId: string) => {
    await deleteReview(reviewId);
  };

  return (
    <div className="space-y-6">
      {session && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={rating === value ? "default" : "outline"}
                    onClick={() => setRating(value)}
                    className="w-10 h-10 p-0"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this deployment..."
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || !rating}>
              Submit Review
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Reviews</h3>
        {isLoading ? (
          <div className="text-center py-4">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.user.image} alt={review.user.name} />
                      <AvatarFallback>
                        {review.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {session?.user?.email === review.user.email && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate(review.id, review.rating, review.comment)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <span
                        key={value}
                        className={`text-lg ${
                          value <= review.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 