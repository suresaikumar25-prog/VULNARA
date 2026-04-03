import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: []
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'your-app.vercel.app']
    }
  }
}

export default nextConfig
