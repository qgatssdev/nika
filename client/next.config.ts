import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    API_URL: process.env.API_URL,
    CLIENT_URL: process.env.CLIENT_URL,
  },
  images: {
    domains: ['cdn.prod.website-files.com'],
  },
};

export default nextConfig;
