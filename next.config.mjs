/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages (Edge) 호환 설정
  experimental: {
    runtime: 'edge', // 모든 페이지를 Edge Runtime에서 실행하도록 강제
  },
};

export default nextConfig;
