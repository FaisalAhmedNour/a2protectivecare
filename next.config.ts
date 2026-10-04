import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  trailingSlash: true,
  experimental: {
    serverActions: { bodySizeLimit: '60mb' },
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    deviceSizes: [320, 480, 768, 1024, 1440, 1920],
    imageSizes: [96, 160, 240],
  },
};
export default nextConfig;
