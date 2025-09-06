/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        async_hooks: false,
        events: false,
      };
    }
    
    // Handle OpenTelemetry warnings
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      /Serializing big strings/,
    ];

    // Optimize cache performance
    config.cache = {
      ...config.cache,
      compression: 'gzip',
      maxMemoryGenerations: 1,
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    // Enhanced optimization for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 20,
            },
            ui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15,
            },
          },
        },
        runtimeChunk: 'single',
        usedExports: true,
        sideEffects: false,
      };
    }

    // Optimize module resolution
    config.resolve.modules = ['node_modules', 'src'];
    
    return config;
  },
  
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['@prisma/client', '@upstash/redis', 'framer-motion', 'lucide-react'],
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Reduce bundle size warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Output configuration for better performance
  output: 'standalone',
  
  // Enable SWC minification
  swcMinify: true,
};

module.exports = nextConfig; 