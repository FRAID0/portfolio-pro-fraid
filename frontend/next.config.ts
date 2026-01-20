import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Ajout de la configuration pour Docker (Hot Reload sur Windows)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;