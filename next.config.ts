import type { NextConfig } from 'next'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const nextConfig: NextConfig = {
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  // Allow images from Farcaster CDN and common avatar hosts
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'imagedelivery.net' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: '**.ipfs.dweb.link' },
    ],
  },
}

export default nextConfig
