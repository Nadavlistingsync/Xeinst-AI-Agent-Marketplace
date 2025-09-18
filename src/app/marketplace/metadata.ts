import { Metadata } from 'next';

export const marketplaceMetadata: Metadata = {
  title: 'AI Agent Marketplace | Xeinst - Discover Liquid Intelligence',
  description: 'Explore our curated collection of AI agents with bubble-like fluidity. Search, filter, and deploy intelligent automation that flows like liquid through your workflow.',
  keywords: [
    'AI agents',
    'artificial intelligence',
    'automation',
    'marketplace',
    'liquid AI',
    'bubble design',
    'workflow automation',
    'intelligent agents',
    'AI tools',
    'machine learning',
    'productivity',
    'business automation'
  ],
  authors: [{ name: 'Xeinst Team' }],
  creator: 'Xeinst',
  publisher: 'Xeinst',
  
  // Open Graph
  openGraph: {
    title: 'AI Agent Marketplace | Xeinst - Liquid Intelligence',
    description: 'Discover AI agents that flow like liquid intelligence. Browse, search, and deploy automation that adapts to your workflow.',
    type: 'website',
    locale: 'en_US',
    url: 'https://xeinst.vercel.app/marketplace',
    siteName: 'Xeinst AI Agent Marketplace',
    images: [
      {
        url: '/api/og/marketplace',
        width: 1200,
        height: 630,
        alt: 'Xeinst AI Agent Marketplace - Liquid Intelligence',
        type: 'image/png',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Marketplace | Xeinst',
    description: 'Discover AI agents that flow like liquid intelligence',
    images: ['/api/og/marketplace'],
    creator: '@xeinst',
    site: '@xeinst',
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Structured data will be added via JSON-LD in the component
  other: {
    'theme-color': '#000000',
    'color-scheme': 'dark light',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Xeinst',
    'application-name': 'Xeinst',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://xeinst.vercel.app/marketplace',
  },
  
  // Category for app stores
  category: 'technology',
};