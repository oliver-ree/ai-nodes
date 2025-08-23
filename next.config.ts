import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  // GitHub Pages deployment configuration
  basePath: process.env.NODE_ENV === 'production' ? '/ai-nodes' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ai-nodes/' : '',
};

export default nextConfig;
