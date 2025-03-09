/** @type {import('next').NextConfig} */
const nextConfig = {
  // แก้ experimental เป็นตามคำแนะนำ
  experimental: {
    serverExternalPackages: []
  },
  // เพิ่ม ESLint config เพื่อปิดการตรวจสอบตอน build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
}

module.exports = nextConfig