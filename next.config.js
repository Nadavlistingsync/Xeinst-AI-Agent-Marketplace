/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // Only ignore during builds if you're confident in your code
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Only ignore during builds if you're confident in your code
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'your-production-domain.com'],
    },
  },
  // Add webpack configuration for better error handling
  webpack: (config, { isServer }) => {
    // Add custom webpack config here if needed
    return config;
  },
}

module.exports = nextConfig; 