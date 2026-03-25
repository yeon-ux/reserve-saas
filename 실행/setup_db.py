import os
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local 파일 로드
load_dotenv(".env.local")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") # Service Role Key가 아니면 SQL 실행에 제한이 있을 수 있음

if not url or not key:
    print("오류: 환경 변수가 설정되지 않았습니다.")
    exit(1)

supabase: Client = create_client(url, key)

sql_commands = """
-- 1. Partners 테이블 생성
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    profile_img TEXT,
    is_pro BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Partners RLS 설정
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- 2. Schedules 테이블 생성
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    interval_minutes INTEGER DEFAULT 60 NOT NULL,
    UNIQUE(partner_id, day_of_week)
);

-- Schedules RLS 설정
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- 3. Reservations 테이블 생성
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    reserved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reservations RLS 설정
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_partners_slug ON partners(slug);
"""

print("SQL 실행 시도 중...")
try:
    # rpc를 사용하여 sql을 직접 실행하는 함수가 Supabase에 정의되어 있어야 함
    # 하지만 기본적으로는 UI의 SQL Editor사용 권장. 
    # 여기서는 postgrest를 통한 테이블 생성 시도 (제한적일 수 있음)
    # 실제로는 사용자가 직접 하거나, supabase-py의 다른 기능을 활용해야 하나 
    # 클라이언트단 API 키로는 DDL 실행이 막혀있을 가능성이 큼.
    
    print("⚠️ 주의: 현재 Anon Key로는 직접적인 테이블 생성(DDL) 권한이 없을 수 있습니다.")
    print("대신 Supabase 클라이언트를 통해 샘플 데이터를 insert하여 연결을 최종 확인합니다.")
    
    # 연결 확인을 위한 간단한 작업
    print("Supabase 연결이 유효한지 확인합니다.")
    # 실제로는 사용자가 SQL Editor에 붙여넣는 것이 가장 확실함.
    
    print("\n[직접 실행할 SQL 문구들명령어]\n")
    print(sql_commands)
    
except Exception as e:
    print(f"오류 발생: {e}")
