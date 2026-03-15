# 깃허브 업로드 자동 스크립트
Write-Host "🚀 깃허브에 코드를 업로드합니다..." -ForegroundColor Cyan

# 1. Git 초기화 체크
if (!(Test-Path .git)) {
    git init
}

# 2. 파일 추가 및 커밋
git add .
git commit -m "Initial commit for reservation platform"

# 3. 브랜치 설정 및 저장소 연결
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/yeon-ux/reserve-saas.git

# 4. 푸시 시도
Write-Host "📤 깃허브로 파일을 전송합니다 (로그인 창이 뜨면 로그인해 주세요)..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 업로드 성공! 이제 Cloudflare Pages에서 배포를 진행하세요." -ForegroundColor Green
} else {
    Write-Host "❌ 업로드 실패. Git이 설치되어 있는지 확인해 주세요." -ForegroundColor Red
}

pause
