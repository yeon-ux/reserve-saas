/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages (Edge) 호환 설정
  experimental: {
    runtime: 'edge',
  },
};

export default nextConfig;
