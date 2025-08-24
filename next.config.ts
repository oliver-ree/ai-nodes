import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel deployment
  // output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // distDir: 'dist',
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove GitHub Pages config for Vercel
  // basePath: process.env.NODE_ENV === 'production' ? '/ai-nodes' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/ai-nodes/' : '',
};

export default nextConfig;
