"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PurchasesDashboard() {
  const { data: session } = useSession();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    const fetchPurchases = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("purchases")
          .select("*, product:products(*)")
          .eq("user_id", session.user.email)
          .order("purchased_at", { ascending: false });
        if (error) throw error;
        setPurchases(data || []);
      } catch (err) {
        setError("Failed to fetch purchases");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [session?.user?.email]);

  const handleDownload = async (product: any) => {
    try {
      const res = await fetch(`/api/download-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        alert(data.error || 'Failed to get download link');
      }
    } catch (err) {
      alert('Failed to download');
    }
  };

  if (!session) return <div className="text-center mt-20">Sign in to view your purchases.</div>;
  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white/10 rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-white">My Purchases</h1>
      {purchases.length === 0 ? (
        <div className="text-gray-300">You haven't purchased any agents yet.</div>
      ) : (
        <ul className="space-y-6">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="bg-black/30 rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="text-xl font-semibold text-white">{purchase.product?.name}</div>
                <div className="text-gray-300">{purchase.product?.description}</div>
              </div>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                onClick={() => handleDownload(purchase.product)}
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 