# Phase 7: Cloudflare Pages 배포 및 DNS 설정 가이드

구축된 예약 플랫폼을 전 세계 어디서나 접속 가능하도록 배포하고, `reserve.smarthow.net` 도메인을 연결하는 방법입니다.

## 1. Cloudflare Pages 배포 가이드

1.  **GitHub 리포지토리 생성 및 푸시:**
    *   작업한 코드를 GitHub에 업로드합니다.
2.  **Cloudflare 대시보드 접속:**
    *   `Workers & Pages` > `Create application` > `Pages` > `Connect to Git` 선택.
3.  **빌드 설정 (중요):**
    *   **Framework Preset:** `Next.js`
    *   **Build command:** `npx @cloudflare/next-on-pages`
    *   **Build output directory:** `.vercel/output/static`
    *   **Environment Variables 추가:**
        *   `NEXT_PUBLIC_SUPABASE_URL`: (본인의 Supabase URL)
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (본인의 Supabase Anon Key)

## 2. 서브도메인(reserve.smarthow.net) 연결

메인 로그(`smarthow.net`)는 블로거를 유지하면서, 예약 서비스만 분리하여 연결합니다.

1.  Cloudflare Pages 프로젝트 페이지의 **'Custom domains'** 탭 클릭.
2.  `Set up a custom domain` 클릭 후 `reserve.smarthow.net` 입력.
3.  Cloudflare가 자동으로 DNS 레코드(CNAME)를 추가해 줍니다.
4.  **SSL/TLS 설정:** Cloudflare에서 자동으로 인증서를 발급하여 `https://` 보안 접속을 지원합니다.

## 3. Cloudflare 최적화 설정 (`next.config.mjs`)

Edge 환경에서 최상의 성능을 위해 다음 설정을 확인하세요.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages (Edge) 호환 설정
  experimental: {
    runtime: 'edge', // 모든 페이지를 Edge Runtime에서 실행하도록 강제
  },
};

export default nextConfig;
```
