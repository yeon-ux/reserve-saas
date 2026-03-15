-- 휴식 시간(Breaks)을 저장하기 위한 테이블 추가
CREATE TABLE breaks (
    id SERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    label TEXT -- '점심시간', '저녁시간' 등
);

-- Breaks RLS 설정
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Breaks can be viewed by everyone" 
ON breaks FOR SELECT USING (true);

CREATE POLICY "Partners can manage their own breaks" 
ON breaks FOR ALL USING (auth.uid() = partner_id);
