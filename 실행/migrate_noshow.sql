-- Reservations 테이블에 노쇼 기록 필드 추가
ALTER TABLE reservations 
ADD COLUMN no_show_at TIMESTAMP WITH TIME ZONE;

-- 노쇼 이력이 있는 사용자를 필터링하기 위한 인덱스
CREATE INDEX idx_reservations_phone_noshow ON reservations(customer_phone) 
WHERE no_show_at IS NOT NULL;
