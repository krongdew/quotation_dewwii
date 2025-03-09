/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: [],
  },
  // ปิดการตรวจสอบ TypeScript ชั่วคราว
  typescript: {
    ignoreBuildErrors: true,
  },
  // ปิดการตรวจสอบ ESLint ชั่วคราว
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;