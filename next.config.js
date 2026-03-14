// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
  images: { domains: ['supabase.co', 'cloudflare.com'] },
}
module.exports = nextConfig
