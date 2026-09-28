import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  transpilePackages: [
    '@tronhanh/api',
    '@tronhanh/schemas',
    '@tronhanh/constants',
    '@tronhanh/utils',
  ],
};

export default nextConfig;
