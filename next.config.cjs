const { withSentryConfig } = require('@sentry/nextjs');

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
      allowedOrigins: ['localhost:3000', '*.vercel.app', '*.ai-agency.com'],
    },
  },
  // Add webpack configuration for better error handling
  webpack: (config, { isServer }) => {
    // Add custom webpack config here if needed
    return config;
  },
  // Ensure API routes are not statically optimized
  output: 'standalone',
  // Configure which routes should be dynamic
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: true, // Suppresses all logs
  hideSourceMaps: true,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions); 