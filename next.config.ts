import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    deviceSizes: [320, 480, 768, 1024, 1440, 1920],
    imageSizes: [96, 160, 240],
  },
};
export default nextConfig;
