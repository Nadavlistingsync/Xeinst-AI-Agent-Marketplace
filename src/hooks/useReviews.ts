import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image: string;
  };
}

interface UseReviewsProps {
  deploymentId: string;
}

export function useReviews({ deploymentId }: UseReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deployments/${deploymentId}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const createReview = async (rating: number, comment: string) => {
    if (!session) {
      toast.error("You must be signed in to leave a review");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/deployments/${deploymentId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create review");
      }

      const newReview = await response.json();
      setReviews((prev) => [newReview, ...prev]);
      toast.success("Review submitted successfully");
    } catch (error) {
      console.error("Error creating review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create review");
    } finally {
      setIsLoading(false);
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment: string) => {
    if (!session) {
      toast.error("You must be signed in to update a review");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/deployments/${deploymentId}/reviews`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, rating, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update review");
      }

      const updatedReview = await response.json();
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? updatedReview : review
        )
      );
      toast.success("Review updated successfully");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update review");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!session) {
      toast.error("You must be signed in to delete a review");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/deployments/${deploymentId}/reviews`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete review");
      }

      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete review");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reviews,
    isLoading,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
  };
} 