"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getProduct, getProductReviews, createReview } from "@/lib/db-helpers";
import { toast } from "react-hot-toast";

export default function ProductPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, reviewsData] = await Promise.all([
          getProduct(params.id),
          getProductReviews(params.id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (err) {
        setError("Failed to load product data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("You must be logged in to leave a review");
      return;
    }

    try {
      const review = await createReview({
        product_id: params.id,
        user_id: session.user.id,
        rating,
        comment: reviewText,
      });
      setReviews([...reviews, review]);
      setReviewText("");
      setRating(5);
      toast.success("Review submitted successfully");
    } catch (err) {
      toast.error("Failed to submit review");
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Uploaded by:</strong> {product.uploaded_by}</p>
          </div>
          {product.documentation && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Documentation</h2>
              <p className="whitespace-pre-wrap">{product.documentation}</p>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          {reviews.map((review) => (
            <div key={review.id} className="border-b py-4">
              <div className="flex items-center mb-2">
                <span className="font-semibold">{review.user_id}</span>
                <span className="ml-2">★ {review.rating}</span>
              </div>
              <p>{review.comment}</p>
            </div>
          ))}
          {session?.user && (
            <form onSubmit={handleReviewSubmit} className="mt-6">
              <div className="mb-4">
                <label className="block mb-2">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full border p-2 rounded"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border p-2 rounded"
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 