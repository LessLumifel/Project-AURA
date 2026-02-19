/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    proxyClientMaxBodySize: 50 * 1024 * 1024
  }
};

export default nextConfig;
