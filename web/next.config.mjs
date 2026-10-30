/** @type {import('next').NextConfig} */
const isStatic = process.env.STATIC_EXPORT === '1';
// GitHub Pages project sites are served from /<repo>, so assets need the prefix
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  ...(isStatic ? { output: 'export', images: { unoptimized: true }, trailingSlash: true } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  experimental: {
    // AGENTS.md is read with fs at runtime, so it must ship with the server bundle
    outputFileTracingIncludes: {
      '/api/chat': ['./AGENTS.md'],
    },
  },
};

export default nextConfig;
