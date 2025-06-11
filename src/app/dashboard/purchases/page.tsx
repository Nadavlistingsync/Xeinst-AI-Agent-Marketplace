import { getUserPurchases } from "@/lib/db-helpers";
import type { PurchaseWithProduct } from "@/lib/db-helpers";
import Link from "next/link";

export default async function PurchasesPage({ searchParams }: { searchParams?: { userId?: string } }) {
  // You may want to get the userId from session or props, here we assume it's passed in searchParams for demo
  const userId = searchParams?.userId || "";
  const purchases: PurchaseWithProduct[] = userId ? await getUserPurchases(userId) : [];

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
                  <h2 className="text-xl font-semibold mb-2">{purchase.product.name}</h2>
                  <p className="text-gray-600 mb-2">{purchase.product.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Category: {purchase.product.category}</span>
                    <span>Price: ${purchase.product.price}</span>
                    <span>Purchased: {new Date(purchase.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link
                  href={`/product/${purchase.productId}`}
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