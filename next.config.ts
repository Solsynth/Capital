import type { NextConfig } from 'next'

import { i18n } from './next-i18next.config'

const nextConfig: NextConfig = {
  /* config options here */
  i18n,
  reactStrictMode: true,
  output: 'standalone',
  generateBuildId: async () => {
    return process.env.GIT_HASH ?? 'development'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.sn.solsynth.dev',
      },
      {
        protocol: 'https',
        hostname: 'api.sn.solsynth.dev',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/:path*',
        destination: '/api/well-known/:path*',
      },
    ]
  },
}

export default nextConfig
