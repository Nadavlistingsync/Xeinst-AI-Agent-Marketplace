"use client";
export const dynamic = "force-dynamic";
import { useSession } from 'next-auth/react';
import Marketplace from '@/components/Marketplace';
import MarketplaceNav from '@/components/MarketplaceNav';

export default function MarketplacePage() {
  const { data: session } = useSession();

  return (
    <div>
      <MarketplaceNav />
      <Marketplace session={session} />
    </div>
  );
} 