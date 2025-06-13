import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    viewTransition: true,
    optimizePackageImports: ['iconsax-react'],
  },
  compiler: {
    removeConsole:
        process.env.NODE_ENV === 'production'
            ? { exclude: ['error', 'warn'] }
            : false,
  },
};

export default nextConfig;
