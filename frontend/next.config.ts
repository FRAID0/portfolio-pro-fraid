import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable reactCompiler since it causes OOM on Vercel's limited free tier RAM
  reactCompiler: false,
  // Disable sourcemaps to save RAM during Vercel build
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache in production to prevent OOM
    if (!dev) {
      config.cache = false;
    }

    // Ajout de la configuration pour Docker (Hot Reload sur Windows)
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://backend:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;