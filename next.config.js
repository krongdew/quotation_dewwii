/** @type {import('next').NextConfig} */
const nextConfig = {
  // แก้ experimental เป็นตามคำแนะนำ
  experimental: {
    serverExternalPackages: []
  },
  // เพิ่ม ESLint config เพื่อปิดการตรวจสอบตอน build
  eslint: {
    // ปิดการตรวจสอบ ESLint เมื่อ build
    ignoreDuringBuilds: true,
  }
}

// next.config.js
module.exports = {
  output: 'export',
}