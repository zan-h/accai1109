import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // serverActions: true, // Enabled by default in Next.js 14+
  },
  // Ensure we don't double-package common large libs
  webpack: (config) => {
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
