/**
 * [최종판] 모든 조건이 통합된 예약 가능 시간 필터링 엔진
 */

interface Config {
  startTime: string;   // "10:00"
  endTime: string;     // "22:00"
  interval: number;    // 60
}

interface TimeRange {
  start: string;
  end: string;
}

interface Event {
  type: 'recurring' | 'single';
  dayOfWeek?: number;
  date?: string;
  start: string;
  end: string;
}

export function calculateFinalSlots(
  selectedDate: string,      // "2024-03-20"
  dayOfWeek: number,         // 3 (수)
  workConfig: Config | null, // 해당 요일 근무 설정
  breaks: TimeRange[],       // 점심, 저녁 등
  holidays: string[],        // 공휴일 날짜 리스트 ["2024-12-25"]
  events: Event[],           // 정기/비정기 일정 리스트
  reservations: string[]     // 이미 신청된 시간 ["14:00"]
): string[] {
  // 1. 공휴일 체크
  if (holidays.includes(selectedDate)) return [];

  // 2. 운영 요일 체크
  if (!workConfig) return [];

  const slots: string[] = [];
  const startMin = parseTime(workConfig.startTime);
  const endMin = parseTime(workConfig.endTime);

  for (let current = startMin; current < endMin; current += workConfig.interval) {
    const timeStr = formatTime(current);

    // 3. 휴식 시간 필터링
    const isBreak = breaks.some(b => isTimeInRange(timeStr, b.start, b.end));
    if (isBreak) continue;

    // 4. 일정(Events) 필터링 (정기 + 단일 통합)
    const isEventTime = events.some(e => {
      // 해당 일정이 오늘에 해당하는지 확인
      const isTodayEvent = (e.type === 'recurring' && e.dayOfWeek === dayOfWeek) || 
                           (e.type === 'single' && e.date === selectedDate);
      
      if (!isTodayEvent) return false;
      
      // 해당 시간에 걸치는지 확인
      return isTimeInRange(timeStr, e.start, e.end);
    });
    if (isEventTime) continue;

    // 5. 이미 예약된 시간 필터링
    if (reservations.includes(timeStr)) continue;

    slots.push(timeStr);
  }

  return slots;
}

function isTimeInRange(target: string, start: string, end: string): boolean {
  return target >= start && target < end;
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
