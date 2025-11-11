/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      'pino-pretty': false,
    }
    // Allow importing video assets like .webm/.mp4 via asset modules
    config.module = config.module || { rules: [] }
    config.module.rules = config.module.rules || []
    config.module.rules.push({
      test: /\.(webm|mp4|ogg|mov)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[name][hash][ext]' },
    })
    return config
  },
}

export default nextConfig



