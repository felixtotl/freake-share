const path = require('path');

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
  webpack(config) {
    config.resolve.alias['uploads'] = path.resolve(__dirname, 'uploads');
    return config;
  },
};
