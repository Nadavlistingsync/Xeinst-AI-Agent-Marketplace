"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    modelType: '',
    framework: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('status', 'active');

        if (filters.modelType) {
          query = query.eq('model_type', filters.modelType);
        }
        if (filters.framework) {
          query = query.eq('framework', filters.framework);
        }

        // Apply sorting
        switch (filters.sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'price_low':
            query = query.order('price', { ascending: true });
            break;
          case 'price_high':
            query = query.order('price', { ascending: false });
            break;
          case 'popular':
            query = query.order('download_count', { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.modelType, filters.framework, filters.sortBy]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">
          AI Agent Marketplace
        </h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <select
            value={filters.modelType}
            onChange={(e) => setFilters(prev => ({ ...prev, modelType: e.target.value }))}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Model Types</option>
            <option value="GPT-3">GPT-3</option>
            <option value="BERT">BERT</option>
            <option value="Custom">Custom</option>
          </select>

          <select
            value={filters.framework}
            onChange={(e) => setFilters(prev => ({ ...prev, framework: e.target.value }))}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Frameworks</option>
            <option value="TensorFlow">TensorFlow</option>
            <option value="PyTorch">PyTorch</option>
            <option value="Hugging Face">Hugging Face</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={item}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <Link href={`/marketplace/${product.slug}`}>
                  <h2 className="text-xl font-bold text-white mb-2">{product.name}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {product.model_type}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {product.framework}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {product.download_count} downloads
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
} 