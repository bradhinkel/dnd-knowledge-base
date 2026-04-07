

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'dnd.bradhinkel.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow iframe embedding from WordPress site
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://bradhinkel.com https://www.bradhinkel.com",
          },
        ],
      },
    ]
  },
}

export default nextConfig
