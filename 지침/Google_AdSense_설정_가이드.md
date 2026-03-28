# 💰 Google AdSense 수익화 설정 가이드

본 서비스에 구글 애드센스 광고를 송출하기 위한 설정 단계입니다.

## 1. 애드센스 퍼블리셔 ID 확인
1. [Google AdSense](https://adsense.google.com/) 로그인
2. **계정 > 설정 > 계정 정보**로 이동
3. `pub-xxxxxxxxxxxxxxxx` 형태의 **게시자 ID**를 복사합니다.

## 2. 소스 코드에 ID 적용
1. `app/layout.tsx` 파일을 엽니다.
2. 21번 라인 부근의 `ca-pub-xxxxxxxxxxxxxxxx` 부분을 복사한 본인의 ID로 교체합니다.
3. `components/AdBanner.tsx` 파일을 엽니다.
4. 19번 라인 부근의 `client` 기본값을 본인의 ID로 교체합니다.

## 3. 광고 단위(Slot ID) 생성 및 배치
1. 애드센스 대시보드에서 **광고 > 광고 단위 기준** 클릭
2. **디스플레이 광고** 선택
3. 이름을 정하고(예: 'landing-footer') 생성 버튼 클릭
4. 코드에서 `data-ad-slot="xxxxxxx"` 부분의 숫자(**슬롯 ID**)를 복사합니다.
5. `app/page.tsx` 또는 `app/[slug]/page.tsx` 내의 `<AdBanner />` 컴포넌트 호출 시 `slot` 속성에 해당 ID를 넣습니다.

```tsx
<AdBanner slot="복사한_슬롯_ID" />
```

## 4. 사이트 승인 (중요)
1. 애드센스 **사이트** 메뉴에 본인의 도메인(예: `reserve.smarthow.net`)을 등록합니다.
2. 구글의 검토가 완료되어야 실제 광고가 송출됩니다. (검토 중에는 빈 공간으로 표시될 수 있습니다.)

> [!TIP]
> 광고가 바로 보이지 않더라도 `AdBanner` 컴포넌트가 레이아웃을 잡고 있으므로, 승인 후 자동으로 광고가 채워집니다.
