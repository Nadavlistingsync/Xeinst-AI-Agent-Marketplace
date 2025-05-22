"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Star } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  documentation: string;
  file_url: string;
  average_rating: number;
  total_ratings: number;
  download_count: number;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [hasPurchased, setHasPurchased] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkPurchaseStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("product_id", id)
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setHasPurchased(true);
      }
    } catch (err) {
      console.error("Error checking purchase status:", err);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProduct();
      await checkPurchaseStatus();
    };
    fetchData();
  }, [fetchProduct, checkPurchaseStatus]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      const { data, error } = await supabase.storage
        .from("products")
        .createSignedUrl(product!.file_url, 60 * 10); // 10 minutes

      if (error) throw error;

      // Increment download count
      await supabase
        .from("products")
        .update({ download_count: product!.download_count + 1 })
        .eq("id", product!.id);

      window.open(data.signedUrl, "_blank");
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!product) return <div className="text-center mt-20 text-red-600">Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <div className="mb-2 text-gray-600">Category: {product.category}</div>
      
      <div className="flex items-center mb-4">
        <Star className="w-5 h-5 text-yellow-400" />
        <span className="ml-1 text-gray-600">
          {product.average_rating?.toFixed(1) || "New"}
        </span>
        {product.total_ratings > 0 && (
          <span className="ml-1 text-gray-500">
            ({product.total_ratings} reviews)
          </span>
        )}
      </div>

      <div className="mb-4">{product.description}</div>
      <div className="mb-4 font-bold text-2xl">${product.price.toFixed(2)}</div>
      
      <div className="mb-8 prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">Documentation</h2>
        <div className="whitespace-pre-line">{product.documentation}</div>
      </div>

      {hasPurchased ? (
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-60"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "Processing..." : "Download"}
        </button>
      ) : (
        <button
          className="bg-gray-600 text-white px-6 py-3 rounded-lg cursor-not-allowed"
          disabled
        >
          Payment System Coming Soon
        </button>
      )}

      {downloadError && (
        <div className="mt-4 text-red-600">{downloadError}</div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {product.download_count} downloads
      </div>
    </div>
  );
} 