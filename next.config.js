/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      }
    }
    
    // Exclude browser-only modules from server bundle
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@monaco-editor/react': 'commonjs @monaco-editor/react',
        'xterm': 'commonjs xterm',
        'xterm-addon-fit': 'commonjs xterm-addon-fit',
        'xterm-addon-web-links': 'commonjs xterm-addon-web-links',
      })
    }
    
    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://api.redst0ne8.site'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig