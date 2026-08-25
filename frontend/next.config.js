/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Thêm dòng này để Next.js xuất ra thư mục 'out'
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
  // Next.js 15: turbopack is stable
  experimental: {},
};

module.exports = nextConfig;
