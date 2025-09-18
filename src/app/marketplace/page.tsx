import React from 'react';
import { Metadata } from 'next';
import { SimpleLiquidMarketplace } from '../../components/SimpleLiquidMarketplace';
import { marketplaceMetadata } from './metadata';

export const metadata: Metadata = marketplaceMetadata;

export default function Marketplace() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "AI Agent Marketplace",
            "description": "Discover AI agents that flow like liquid intelligence",
            "url": "https://xeinst.vercel.app/marketplace",
            "mainEntity": {
              "@type": "ItemList",
              "name": "AI Agents",
              "description": "Collection of AI agents for automation and productivity",
              "numberOfItems": "1200+",
              "itemListElement": [
                {
                  "@type": "SoftwareApplication",
                  "name": "AI Agent",
                  "applicationCategory": "ProductivityApplication",
                  "operatingSystem": "Web",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                }
              ]
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://xeinst.vercel.app"
                },
                {
                  "@type": "ListItem", 
                  "position": 2,
                  "name": "Marketplace",
                  "item": "https://xeinst.vercel.app/marketplace"
                }
              ]
            }
          })
        }}
      />
      <SimpleLiquidMarketplace />
    </>
  );
}