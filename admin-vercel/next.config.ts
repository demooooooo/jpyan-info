import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const isVercelBuild = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
const hasPostgresEnv = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL)

if (!isVercelBuild && !hasPostgresEnv) {
  initOpenNextCloudflareForDev()
}

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
    serverExternalPackages: ['drizzle-kit', 'jose', 'pg-cloudflare'],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias || {}),
      '@payloadcms/translations/dist/importDateFNSLocale.js': path.resolve(
        dirname,
        'src/shims/payload/importDateFNSLocale.ts',
      ),
      '@payloadcms/ui/shared': path.resolve(dirname, 'src/shims/payload/uiShared.ts'),
      '@payloadcms/ui/dist/elements/CodeEditor/CodeEditor.js': path.resolve(
        dirname,
        'src/shims/payload/CodeEditor.tsx',
      ),
      '@payloadcms/ui/dist/elements/DatePicker/DatePicker.js': path.resolve(
        dirname,
        'src/shims/payload/DatePicker.tsx',
      ),
    }

    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
