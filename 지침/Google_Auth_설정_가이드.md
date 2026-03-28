# Google 로그인(OAuth) 설정 상세 가이드 🚀

Supabase에서 구글 로그인을 활성화하기 위해 필요한 **Client ID**와 **Client Secret**을 발급받는 방법입니다.

---

### Step 1: Google Cloud Console 접속 및 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 좌측 상단 '프로젝트 선택' (또는 '새 프로젝트')을 클릭하여 프로젝트를 하나 만듭니다. (예: `My Reserve App`)

### Step 2: OAuth 동의 화면(Consent Screen) 설정
1. 좌측 메뉴에서 **API 및 서비스 > OAuth 동의 화면**으로 이동합니다.
2. User Type을 **외부(External)**로 선택하고 **만들기**를 누릅니다.
3. **앱 정보** 입력:
   - 앱 이름: `Smart Reserve` (자유롭게 입력)
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. 나머지는 기본값으로 두고 **저장 후 계속**을 끝까지 눌러 완료합니다.
   - *팁: '테스트 사용자' 단계에서 본인의 구글 계정을 'Add Users'로 추가해두어야 테스트가 가능합니다.*

### Step 3: 사용자 인증 정보(Credentials) 생성
1. 좌측 메뉴에서 **API 및 서비스 > 사용자 인증 정보**로 이동합니다.
2. 상단 **+ 사용자 인증 정보 만들기 > OAuth 클라이언트 ID**를 선택합니다.
3. **애플리케이션 유형**을 **웹 애플리케이션**으로 선택합니다.
4. **이름**을 입력합니다 (예: `Supabase Auth Client`).

### Step 4: 리디렉션 URI 입력 (가장 중요! ⭐)
1. **승인된 리디렉션 URI** 섹션의 **+ URI 추가**를 누릅니다.
2. 아래 주소를 복사해서 붙여넣습니다:
   `https://saqmamfputhcfisvgibx.supabase.co/auth/v1/callback`
   *(이 주소는 파트너님의 Supabase Authentication > Providers > Google 탭에 적혀있는 Callback URL입니다.)*
3. **만들기**를 클릭합니다.

### Step 5: ID 및 Secret 복사 후 Supabase에 입력
1. 생성 완료 팝업창에 뜨는 **클라이언트 ID**와 **클라이언트 보안 비밀(Secret)**을 각각 복사합니다.
2. [Supabase 대시보드](https://supabase.com/dashboard/)로 돌아옵니다.
3. **Authentication > Providers > Google**을 클릭합니다.
4. **Enable Google** 스위치를 켜고, 복사한 두 값을 각각 붙여넣습니다.
5. **Save**를 눌러 저장합니다.

---

### ✅ 이제 확인해보세요!
설정이 완료되었습니다. 이제 `reserve.smarthow.net`의 회원가입/로그인 화면에서 구글 버튼을 누르면 정상적으로 작동할 것입니다!
