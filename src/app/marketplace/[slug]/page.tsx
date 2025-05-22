"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  model_type: string;
  framework: string;
  price: number;
  download_count: number;
  created_at: string;
  file_path: string;
  user_id: string;
  features: string[];
  requirements: string[];
  usage_instructions: string;
}

export default function ProductPage({ params }: any) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (productError) throw productError;
        setProduct(product);

        if (session?.user?.email) {
          await supabase
            .from('purchases')
            .select('*')
            .eq('product_id', product.id)
            .eq('user_id', session.user.email)
            .eq('status', 'completed')
            .single();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug, session?.user?.email]);

  const handlePurchase = async () => {
    if (!session) {
      toast.error('Please sign in to purchase');
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/purchase-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate purchase');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error('Failed to initiate purchase');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
        >
          <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {product.model_type}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              {product.framework}
            </span>
          </div>

          <p className="text-gray-300 mb-8">{product.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-gray-300 flex items-center">
                    <span className="mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {product.requirements.map((requirement, index) => (
                  <li key={index} className="text-gray-300 flex items-center">
                    <span className="mr-2">•</span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Usage Instructions</h2>
            <div className="bg-black/30 rounded-lg p-4">
              <pre className="text-gray-300 whitespace-pre-wrap">
                {product.usage_instructions}
              </pre>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-3xl font-bold text-white">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 ml-2">
                {product.download_count} downloads
              </span>
            </div>

            <button
              onClick={handlePurchase}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Purchase
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 