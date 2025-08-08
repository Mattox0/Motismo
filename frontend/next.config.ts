import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'matteo-ferreira',
  project: 'motismo-t0',

  silent: !process.env.CI,

  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',

  disableLogger: true,

  automaticVercelMonitors: true,
});
