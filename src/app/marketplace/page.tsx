"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/components/SearchFilters';
import { toast } from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProducts } from '@/lib/db-helpers';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  tag: string;
  price?: number;
  image_url?: string;
  average_rating: number;
  total_ratings: number;
  created_at: string;
}

export default async function MarketplacePage() {
  const products = await getProducts();
  const session = await getServerSession(authOptions);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">AI Agents Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 w-full">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1">{product.average_rating || 0}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{product.category}</span>
                <span className="text-lg font-semibold">${product.price}</span>
              </div>
              {product.is_featured && (
                <div className="mt-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 