import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@jeanius/domain',
    '@jeanius/contracts',
    '@jeanius/application',
    '@jeanius/database',
    '@jeanius/integrations',
    '@jeanius/ui',
    '@jeanius/config',
    '@jeanius/observability',
  ],
};

export default nextConfig;
