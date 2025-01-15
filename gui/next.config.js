/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  distDir: '.next',
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig 