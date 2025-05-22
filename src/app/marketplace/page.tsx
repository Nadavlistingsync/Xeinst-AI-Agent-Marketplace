"use client";

import { useSession } from 'next-auth/react';
import Marketplace from '@/components/Marketplace';
import MarketplaceNav from '@/components/MarketplaceNav';

export default function MarketplacePage() {
  const { data: session, status } = useSession();

  return (
    <div>
      <MarketplaceNav />
      <Marketplace />
    </div>
  );
} 