# Phase 1: Next.js 및 Cloudflare Pages 설정 가이드

Cloudflare Pages(Edge Runtime) 환경에서 최적화된 Next.js 프로젝트를 설정하는 방법입니다.

## 1. 프로젝트 초기화 (로컬 터미널에서 실행)

```bash
# Next.js 프로젝트 생성 (App Router, Tailwind, TypeScript 권장)
npx create-next-app@latest reserve-app --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm

# 프로젝트 폴더로 이동
cd reserve-app

# Cloudflare Pages 연동 라이브러리 설치
npm install --save-dev @cloudflare/next-on-pages
```

## 2. Cloudflare 설정 파일 구성

### `wrangler.toml` 생성 (루트 디렉토리)
Edge 환경 설정을 위해 프로젝트 루트에 `wrangler.toml` 파일을 생성합니다.

```toml
name = "reserve-app"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
# 필요한 환경 변수 정의 (예: NEXT_PUBLIC_SUPABASE_URL)
```

## 3. 배포 및 빌드 설정 (Cloudflare Pages Dashboard)

1. **Framework Preset**: `Next.js` 선택
2. **Build Command**: `npx @cloudflare/next-on-pages` (또는 프로젝트 설정에 따라 수정)
3. **Output Directory**: `.vercel/output/static` (기본값)
4. **Environment Variables**:
   - `NODE_VERSION`: `18` 이상 권장
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
