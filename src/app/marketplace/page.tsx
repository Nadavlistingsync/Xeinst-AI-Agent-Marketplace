import { Metadata } from 'next';
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
import prisma from '@/lib/prisma';
import { AgentCard } from '@/components/marketplace/AgentCard';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { FilterBar } from '@/components/marketplace/FilterBar';

interface MarketplacePageProps {
  searchParams: {
    search?: string;
    framework?: string;
    access_level?: string;
    page?: string;
  };
}

export const metadata: Metadata = {
  title: 'Marketplace - Xeinst',
  description: 'Discover and download AI agents',
};

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const session = await getServerSession(authOptions);
  const page = parseInt(searchParams.page || '1');
  const limit = 12;

  const where = {
    ...(searchParams.search && {
      OR: [
        { name: { contains: searchParams.search, mode: 'insensitive' } },
        { description: { contains: searchParams.search, mode: 'insensitive' } },
      ],
    }),
    ...(searchParams.framework && { framework: searchParams.framework }),
    ...(searchParams.access_level && { access_level: searchParams.access_level }),
    ...(session?.user?.subscription_tier === 'basic' && {
      OR: [
        { access_level: 'public' },
        { access_level: 'basic' },
      ],
    }),
    ...(session?.user?.subscription_tier === 'premium' && {
      OR: [
        { access_level: 'public' },
        { access_level: 'basic' },
        { access_level: 'premium' },
      ],
    }),
    ...(!session && { access_level: 'public' }),
  };

  const [agents, total] = await Promise.all([
    prisma.deployments.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    }),
    prisma.deployments.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          {session && (
            <a
              href="/agent-builder"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Agent
            </a>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar />
            <FilterBar />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <a
                      key={pageNum}
                      href={`/marketplace?page=${pageNum}${
                        searchParams.search
                          ? `&search=${searchParams.search}`
                          : ''
                      }${
                        searchParams.framework
                          ? `&framework=${searchParams.framework}`
                          : ''
                      }${
                        searchParams.access_level
                          ? `&access_level=${searchParams.access_level}`
                          : ''
                      }`}
                      className={`px-4 py-2 rounded-md ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </a>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 