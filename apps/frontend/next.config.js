/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@itsm/shared-types'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
