import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow larger request bodies for base64 image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
