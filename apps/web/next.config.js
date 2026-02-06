/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@comic-catalog/core',
    '@comic-catalog/repo',
    '@comic-catalog/ui',
    '@comic-catalog/utils',
  ],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
