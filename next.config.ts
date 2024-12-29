// next.config.js
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Vérifie les changements toutes les secondes
        aggregateTimeout: 300, // Délai avant de compiler après un changement
      };
    }
    return config;
  },
  compiler: {
    removeConsole: isProduction
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
  },
};

module.exports = {
  output: 'export',
  // Vous pouvez également ajouter d'autres configurations spécifiques à votre projet ici
};

export default nextConfig;
