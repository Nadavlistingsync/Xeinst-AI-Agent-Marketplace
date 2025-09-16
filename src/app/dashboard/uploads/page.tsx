import { getUserProducts } from "@/lib/db-helpers";
import Link from "next/link";

export default async function UploadsPage({ searchParams }: { searchParams?: { userId?: string } }) {
  // You may want to get the userId from session or props, here we assume it's passed in searchParams for demo
  const userId = searchParams?.userId || "";
  const products = userId ? await getUserProducts(userId) : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Uploads</h1>
        <Link
          href="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload New
        </Link>
      </div>

      {products.length === 0 ? (
        <p>You haven't uploaded any products yet.</p>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                  <p className="text-gray-600 mb-2">{product.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Category: {product.category}</span>
                    <span>Price: ${product.price}</span>
                    <span>Status: {product.status}</span>
                  </div>
                </div>
                <Link
                  href={`/product/${product.id}`}
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