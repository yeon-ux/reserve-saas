import os
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local 파일 로드
load_dotenv(".env.local")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("오류: 환경 변수가 설정되지 않았습니다.")
    exit(1)

supabase: Client = create_client(url, key)

def test_full_flow():
    test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    test_password = "password123!"
    test_slug = f"test-partner-{uuid.uuid4().hex[:4]}"

    print(f"1. 테스트 계정 가입 시도: {test_email}")
    try:
        # 1. Auth 회원가입
        auth_response = supabase.auth.sign_up({
            "email": test_email,
            "password": test_password,
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"✅ Auth 가입 성공! User ID: {user_id}")
            
            # 2. Partners 테이블 insert (RLS 정책에 의해 본인 ID로만 가능)
            # 주의: 이메일 확인이 활성화되어 있으면 즉시 세션이 생성되지 않아 
            # Anon key로는 insert가 실패할 수 있음.
            print(f"2. 파트너 프로필 생성 시도 (slug: {test_slug})")
            profile_response = supabase.from_("partners").insert({
                "id": user_id,
                "slug": test_slug,
                "name": "테스트 파트너",
                "is_pro": False
            }).execute()
            
            print("✅ 파트너 프로필 생성 성공!")
            
            # 3. 데이터 확인
            print("3. 데이터 조회 테스트...")
            data = supabase.from_("partners").select("*").eq("id", user_id).execute()
            print(f"✅ 조회 결과: {data.data}")
            
            return True
        else:
            print("❌ 가입 응답에 사용 정보가 없습니다. (이메일 확인 대기 중일 수 있음)")
            return False
            
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        # 이메일 확인이 켜져 있는 경우 insert에서 401/403이 날 수 있음
        if "401" in str(e) or "403" in str(e):
            print("💡 팁: Supabase Dashboard -> Auth -> Providers -> Email에서 'Confirm email'을 끄면 바로 테스트가 가능합니다.")
        return False

if __name__ == "__main__":
    test_full_flow()
