import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@jeanius/domain',
    '@jeanius/contracts',
    '@jeanius/application',
    '@jeanius/database',
    '@jeanius/integrations',
    '@jeanius/config',
    '@jeanius/observability',
  ],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };
    return config;
  },
};

export default nextConfig;
