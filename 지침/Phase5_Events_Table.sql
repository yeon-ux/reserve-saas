-- 정기(반복) 및 비정기(단일) 일정을 저장하기 위한 통합 테이블
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('recurring', 'single')),
    title TEXT NOT NULL,
    
    -- 정기 일정일 경우 사용
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    
    -- 비정기 일정일 경우 사용
    event_date DATE,
    
    -- 공통 시간 설정
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Events RLS 설정
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events can be viewed by everyone" 
ON events FOR SELECT USING (true);

CREATE POLICY "Partners can manage their own events" 
ON events FOR ALL USING (auth.uid() = partner_id);

-- 인덱스 설정
CREATE INDEX idx_events_partner_date ON events(partner_id, event_date);
CREATE INDEX idx_events_partner_day ON events(partner_id, day_of_week);
