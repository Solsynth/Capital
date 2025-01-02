import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['raw.sn.solsynth.dev', 'api.sn.solsynth.dev'],
  },
}

export default nextConfig
