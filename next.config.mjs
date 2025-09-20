let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'dist',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '131.189.96.66',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '131.189.96.66',
        port: '',
        pathname: '/media/**',
      },
      // Dynamic hostname for production Cloud Run backend
      ...(process.env.NEXT_PUBLIC_BACKEND_URL ? [{
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_BACKEND_URL).hostname,
        port: '',
        pathname: '/media/**',
      }] : []),
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // For development environment, use rewrites
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://131.189.96.66';
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: '/api/media/:path*',
          destination: `${backendUrl}/media/:path*`,
        }
      ];
    }
    return [];
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
