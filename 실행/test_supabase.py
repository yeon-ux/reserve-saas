import os
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local 파일 로드
load_dotenv(".env.local")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("오류: 환경 변수 NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.")
    exit(1)

print(f"URL: {url}")
print("연결 시도 중...")

try:
    supabase: Client = create_client(url, key)
    # 단순한 쿼리 테스트 (보통 settings나 특정 테이블을 조회해볼 수 있으나, 연결 자체 확인을 위해 에러 응답 확인)
    response = supabase.table("_test").select("*").limit(1).execute()
    print("✅ Supabase 연결 시도 완료 (네트워크 응답 확인)")
    print("참고: '_test' 테이블이 없더라도 연결 자체는 유효할 수 있습니다.")
except Exception as e:
    # 404나 특정 에러는 테이블 이슈일 수 있지만, 
    # 인증 오류(401)나 도메인 오류 등이 발생하면 연결 실패로 간주
    error_msg = str(e)
    if "401" in error_msg or "Invalid key" in error_msg:
        print(f"❌ 인증 실패: API 키를 확인해주세요. ({error_msg})")
    elif "getaddrinfo failed" in error_msg or "failed to connect" in error_msg:
        print(f"❌ 연결 실패: URL 또는 네트워크 상태를 확인해주세요. ({error_msg})")
    else:
        # 테이블이 없어서 발생하는 404인 경우 연결은 성공한 것으로 간주
        if "404" in error_msg:
            print("✅ Supabase 연결 성공! (테이블 '_test'는 존재하지 않지만 인증 및 도메인은 유효함)")
        else:
            print(f"❓ 기타 응답 발생: {error_msg}")
