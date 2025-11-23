/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Not using 'export' in Vercel - API routes needed for Walrus proxy
  // Use environment variable to switch between Vercel (server) and static export (Walrus Sites)
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig

