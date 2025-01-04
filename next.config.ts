import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
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
}

export default nextConfig
