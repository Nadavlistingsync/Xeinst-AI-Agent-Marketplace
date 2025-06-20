"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

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

interface ProductDetailsProps {
  product: Product;
  isPurchased: boolean;
}

export default function ProductDetails({ product, isPurchased }: ProductDetailsProps) {
  const { data: session } = useSession();
  const [purchased, setPurchased] = useState(isPurchased);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!session) {
      signIn();
      return;
    }
    setError(null);
    try {
      const res = await fetch('/api/purchase-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPurchased(true);
      } else {
        setError(data.error || 'Failed to purchase');
      }
    } catch (err) {
      setError('Failed to purchase');
    }
  };

  const handleDownload = async () => {
    if (!session) {
      signIn();
      return;
    }
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${product.id}/download`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Download failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download agent');
    } finally {
      setDownloading(false);
    }
  };

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
            {purchased ? (
              <button
                className={`px-6 py-3 rounded-lg bg-green-600 text-white`}
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'Downloading...' : 'Download'}
              </button>
            ) : (
              <button
                className={`px-6 py-3 rounded-lg bg-blue-600 text-white`}
                onClick={handlePurchase}
              >
                Purchase Agent
              </button>
            )}
          </div>
          {error && (
            <div className="mt-4 text-red-400 text-center">{error}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 