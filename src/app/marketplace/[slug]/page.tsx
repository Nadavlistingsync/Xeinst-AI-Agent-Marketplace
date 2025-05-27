'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import AgentReviews from '@/components/AgentReviews';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  category: string;
  price?: number;
  image_url?: string;
  rating?: number;
  features?: string[];
  requirements?: string[];
  created_by: string;
  average_rating: number;
  total_ratings: number;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        toast.error('Failed to load product');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Product not found</div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        toast.success('Product deleted successfully');
        window.location.href = '/marketplace';
      } catch (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {product.image_url && (
            <div className="w-full h-64 md:h-96 relative">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-4">
                    {product.category}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-600">{product.rating || 0}</span>
                  </div>
                </div>
              </div>
              {product.price && (
                <div className="text-3xl font-bold text-blue-600">
                  ${product.price}
                </div>
              )}
            </div>

            <p className="text-gray-600 text-lg mb-8">{product.description}</p>

            {product.long_description && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">About this Product</h2>
                <p className="text-gray-600">{product.long_description}</p>
              </div>
            )}

            {product.features && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                <ul className="list-disc list-inside space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.requirements && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2">
                  {product.requirements.map((requirement, index) => (
                    <li key={index} className="text-gray-600">{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              {session?.user?.email === product.created_by ? (
                <>
                  <button
                    onClick={() => window.location.href = `/agent/${product.id}/edit`}
                    className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300"
                  >
                    Delete Product
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                    Contact Seller
                  </button>
                  <button className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    Purchase Product
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Reviews & Ratings</h2>
          <AgentReviews
            agentId={product.id}
            averageRating={product.average_rating}
            totalRatings={product.total_ratings}
          />
        </div>
      </div>
    </div>
  );
} 