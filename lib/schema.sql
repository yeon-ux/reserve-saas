-- ==========================================
-- 예약 서비스 통합 데이터베이스 스키마 (Full DDL)
-- ==========================================

-- 1. Partners (파트너/상담사 정보)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    profile_img TEXT,
    is_pro BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can be viewed by everyone" ON partners FOR SELECT USING (true);
CREATE POLICY "Partners can only be updated by owners" ON partners FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Partners can insert their own profile" ON partners FOR INSERT WITH CHECK (auth.uid() = id);
CREATE INDEX idx_partners_slug ON partners(slug);


-- 2. Schedules (요일별 운영 시간)
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    interval_minutes INTEGER DEFAULT 60 NOT NULL,
    UNIQUE(partner_id, day_of_week)
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schedules can be viewed by everyone" ON schedules FOR SELECT USING (true);
CREATE POLICY "Partners can manage their own schedules" ON schedules FOR ALL USING (auth.uid() = partner_id);


-- 3. Breaks (정기 휴게 시간)
CREATE TABLE breaks (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    label TEXT
);

ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Breaks can be viewed by everyone" ON breaks FOR SELECT USING (true);
CREATE POLICY "Partners can manage their own breaks" ON breaks FOR ALL USING (auth.uid() = partner_id);


-- 4. Holidays (공휴일 및 휴무일)
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    label TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    UNIQUE(partner_id, holiday_date)
);

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Holidays can be viewed by everyone" ON holidays FOR SELECT USING (true);
CREATE POLICY "Partners can manage their own holidays" ON holidays FOR ALL USING (auth.uid() = partner_id);
CREATE INDEX idx_holidays_date ON holidays(holiday_date);


-- 5. Events (반복/단일 필터링 일정)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('recurring', 'single')),
    title TEXT NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    event_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events can be viewed by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Partners can manage their own events" ON events FOR ALL USING (auth.uid() = partner_id);
CREATE INDEX idx_events_partner_date ON events(partner_id, event_date);
CREATE INDEX idx_events_partner_day ON events(partner_id, day_of_week);


-- 6. Reservations (예약 내역 및 노쇼 관리)
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    reserved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    no_show_at TIMESTAMP WITH TIME ZONE, -- 노쇼 발생 시 기록 태그
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own reservations" ON reservations FOR SELECT USING (auth.uid() = partner_id);
CREATE POLICY "Customers can insert reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Partners can update their own reservations" ON reservations FOR UPDATE USING (auth.uid() = partner_id);
