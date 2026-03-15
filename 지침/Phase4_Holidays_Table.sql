-- 공휴일 및 사용자 지정 휴무일 테이블 생성
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    label TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    UNIQUE(partner_id, holiday_date)
);

-- Holidays RLS 설정
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holidays can be viewed by everyone" 
ON holidays FOR SELECT USING (true);

CREATE POLICY "Partners can manage their own holidays" 
ON holidays FOR ALL USING (auth.uid() = partner_id);

-- 날짜 검색 최적화를 위한 인덱스
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
