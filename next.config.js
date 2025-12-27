/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'scontent.cdninstagram.com',
      'instagram.com',
      'cdninstagram.com'
    ],
    unoptimized: true
  },
  // Disable telemetry
  webpack: (config) => {
    return config;
  }
};

module.exports = nextConfig;
