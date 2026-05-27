import type { NextConfig } from "next";

// @ts-ignore - Bundle analyzer doesn't have TypeScript types
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    domains: ['raw.githubusercontent.com'], // izin verilen domainler listesine ekle
  },

  // Vercel production build'de ESLint hatalarını ignore et
  eslint: {
    ignoreDuringBuilds: true, // Hatalar build'i kırmasın
  },

  // (Opsiyonel) TypeScript hatalarını da ignore et (eğer TS hatası varsa)
  typescript: {
    ignoreBuildErrors: true,
  },

  /* config options here */
};

export default withBundleAnalyzer(nextConfig);