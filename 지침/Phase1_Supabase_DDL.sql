-- 1. Partners (파트너/상담사 정보) 테이블 생성
CREATE TABLE partners (
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

CREATE POLICY "Partners can be viewed by everyone" 
ON partners FOR SELECT USING (true);

CREATE POLICY "Partners can only be updated by owners" 
ON partners FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Partners can insert their own profile" 
ON partners FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. Schedules (운영 시간) 테이블 생성
CREATE TABLE schedules (
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

CREATE POLICY "Schedules can be viewed by everyone" 
ON schedules FOR SELECT USING (true);

CREATE POLICY "Partners can manage their own schedules" 
ON schedules FOR ALL USING (auth.uid() = partner_id);


-- 3. Reservations (고객 예약 내역) 테이블 생성
CREATE TABLE reservations (
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

CREATE POLICY "Partners can view their own reservations" 
ON reservations FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY "Customers can insert reservations" 
ON reservations FOR INSERT WITH CHECK (true);

CREATE POLICY "Partners can update their own reservations" 
ON reservations FOR UPDATE USING (auth.uid() = partner_id);

-- 슬러그 중복 확인을 위한 인덱스
CREATE INDEX idx_partners_slug ON partners(slug);
