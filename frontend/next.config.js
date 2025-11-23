/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for Walrus Sites (NEXT_EXPORT=true)
  // Regular server for Vercel (default)
  output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig

