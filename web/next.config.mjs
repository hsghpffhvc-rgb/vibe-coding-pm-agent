/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // AGENTS.md is read with fs at runtime, so it must ship with the server bundle
    outputFileTracingIncludes: {
      '/api/chat': ['./AGENTS.md'],
    },
  },
};

export default nextConfig;
