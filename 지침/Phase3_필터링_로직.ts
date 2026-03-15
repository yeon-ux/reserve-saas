/**
 * 예약 가능한 시간 슬롯을 계산하는 비즈니스 로직
 */

interface Schedule {
  startTime: string; // "10:00"
  endTime: string;   // "22:00"
  interval: number;  // 60 (분)
}

interface TimeRange {
  start: string;
  end: string;
}

export function getAvailableSlots(
  daySchedule: Schedule | null,
  breaks: TimeRange[],
  reservations: string[] // ["14:00", "15:00"]
): string[] {
  if (!daySchedule) return []; // 휴무일인 경우

  const slots: string[] = [];
  let current = parseTime(daySchedule.startTime);
  const end = parseTime(daySchedule.endTime);

  while (current < end) {
    const timeString = formatTime(current);
    
    // 1. 휴식 시간인지 확인
    const isBreak = breaks.some(b => {
      const bStart = parseTime(b.start);
      const bEnd = parseTime(b.end);
      return current >= bStart && current < bEnd;
    });

    // 2. 이미 예약된 시간인지 확인
    const isReserved = reservations.includes(timeString);

    // 둘 다 아니면 예약 가능 목록에 추가
    if (!isBreak && !isReserved) {
      slots.push(timeString);
    }

    current += daySchedule.interval;
  }

  return slots;
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
