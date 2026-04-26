/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/pedidos-svc/:path*',
        destination: 'https://pedidos-service-bwn3.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
