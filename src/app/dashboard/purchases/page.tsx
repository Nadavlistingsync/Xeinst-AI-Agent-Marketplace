"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getUserPurchases } from "@/lib/db-helpers";
import Link from "next/link";

export default function PurchasesPage() {
  const { data: session } = useSession();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!session?.user?.id) return;

      try {
        const data = await getUserPurchases(session.user.id);
        setPurchases(data);
      } catch (err) {
        setError("Failed to load purchases");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [session?.user?.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Purchases</h1>

      {purchases.length === 0 ? (
        <p>You haven't purchased any products yet.</p>
      ) : (
        <div className="grid gap-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{purchase.name}</h2>
                  <p className="text-gray-600 mb-2">{purchase.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Category: {purchase.category}</span>
                    <span>Price: ${purchase.price}</span>
                    <span>Purchased: {new Date(purchase.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link
                  href={`/product/${purchase.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 