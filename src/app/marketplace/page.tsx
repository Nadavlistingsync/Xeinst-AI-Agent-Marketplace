"use client";

export const dynamic = "force-dynamic";
// import { useSession } from 'next-auth/react';
import Marketplace from '@/components/Marketplace';
import MarketplaceNav from '@/components/MarketplaceNav';

export default function MarketplacePage() {
  // Remove destructuring if session and status are not used
  // const { data: session, status } = useSession();

  return (
    <div>
      <MarketplaceNav />
      <Marketplace />
    </div>
  );
} 