"use client";

import { Star } from 'lucide-react';
import Image from 'next/image';
import { AgentReviews } from '@/components/AgentReviews';
import { Product } from '@/lib/schema';
import { Decimal } from '@prisma/client/runtime/library';

interface AgentPageClientProps {
  product: Product;
  isCreator: boolean;
}

export function AgentPageClient({ product, isCreator }: AgentPageClientProps) {
  // Helper function to convert Decimal to number
  const formatDecimal = (value: Decimal | number | null): number => {
    if (value === null) return 0;
    return typeof value === 'number' ? value : Number(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96 w-full">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-1">{formatDecimal(product.average_rating)}</span>
                <span className="ml-2 text-gray-500">
                  ({product.total_ratings} reviews)
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">${formatDecimal(product.price)}</div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.longDescription || product.description}</p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="list-disc list-inside text-gray-600">
                {product.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {product.requirements && product.requirements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Requirements</h2>
              <ul className="list-disc list-inside text-gray-600">
                {product.requirements.map((requirement: string, index: number) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            {isCreator ? (
              <>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Edit
                </button>
                <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                  Delete
                </button>
              </>
            ) : (
              <>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Contact Creator
                </button>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Purchase
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <AgentReviews
          product_id={product.id}
          average_rating={formatDecimal(product.average_rating)}
          total_ratings={product.total_ratings}
        />
      </div>
    </div>
  );
} 