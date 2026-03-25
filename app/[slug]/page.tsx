"use client";

import { calculateFinalSlots, WorkConfig, TimeRange, ReservationEvent } from "@/lib/filtering";
import { format, addDays, isSameDay, getDay } from "date-fns";
import { ko } from "date-fns/locale";

export default function ReservationPage({ params }: { params: { slug: string } }) {
  const [partner, setPartner] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // 가용 시간 계산을 위한 상태들
  const [workConfigs, setWorkConfigs] = useState<Record<number, WorkConfig>>({});
  const [breaks, setBreaks] = useState<TimeRange[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [events, setEvents] = useState<ReservationEvent[]>([]);
  const [reservations, setReservations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPartnerData() {
      // 1. 파트너 정보 가져오기
      const { data: partnerData } = await supabase
        .from('partners')
        .select('*')
        .eq('slug', params.slug)
        .single();
      
      if (!partnerData) return;
      setPartner(partnerData);

      // 2. 운영 시간(Schedules) 가져오기
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*')
        .eq('partner_id', partnerData.id);
      
      const configMap: Record<number, WorkConfig> = {};
      scheduleData?.forEach(s => {
        configMap[s.day_of_week] = {
          startTime: s.start_time,
          endTime: s.end_time,
          interval: s.interval_minutes
        };
      });
      setWorkConfigs(configMap);

      // 3. 휴게 시간(Breaks) 가져오기
      const { data: breakData } = await supabase
        .from('breaks')
        .select('start_time, end_time, day_of_week')
        .eq('partner_id', partnerData.id);
      
      setBreaks(breakData?.map(b => ({ start: b.start_time, end: b.end_time })) || []);

      // 4. 공휴일(Holidays) 가져오기
      const { data: holidayData } = await supabase
        .from('holidays')
        .select('holiday_date')
        .eq('partner_id', partnerData.id)
        .eq('is_active', true);
      
      setHolidays(holidayData?.map(h => h.holiday_date) || []);

      // 5. 일정(Events) 가져오기
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('partner_id', partnerData.id)
        .eq('is_active', true);
      
      setEvents(eventData?.map(e => ({
        type: e.type as 'recurring' | 'single',
        dayOfWeek: e.day_of_week,
        date: e.event_date,
        start: e.start_time,
        end: e.end_time
      })) || []);
    }
    fetchPartnerData();
  }, [params.slug]);

  // 날짜 선택 시 가용 시간 계산 (필터링 엔진 적용)
  useEffect(() => {
    if (!partner) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayOfWeek = getDay(selectedDate);
    const currentWorkConfig = workConfigs[dayOfWeek] || null;

    // 해당 날짜의 휴게 시간 필터링 (요일 매칭)
    const currentBreaks = breaks; // 실제 로직에서는 요일별로 필터링하거나 엔진 내부에서 처리할 수 있도록 보강 가능

    const slots = calculateFinalSlots(
      dateStr,
      dayOfWeek,
      currentWorkConfig,
      currentBreaks,
      holidays,
      events,
      reservations
    );
    
    setAvailableSlots(slots);
  }, [selectedDate, partner, workConfigs, breaks, holidays, events, reservations]);

  if (!partner) return <div className="p-10 text-center font-bold">로딩 중...</div>;

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-40">
      {/* 프리미엄이 아닌 경우 상단 광고 */}
      {!partner.is_pro && (
        <div className="bg-white border-b border-slate-100">
           <AdSenseBanner client="ca-pub-xxx" slot="xxx" />
        </div>
      )}

      <header className="p-8 pb-6 bg-white rounded-b-[48px] shadow-sm mb-6">
        <div className="flex items-center space-x-5 mb-8">
          <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100">
            {partner.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{partner.name}</h1>
            <p className="text-slate-400 text-sm font-bold mt-1 tracking-tight">{partner.bio || "환영합니다! 예약을 진행해 주세요."}</p>
          </div>
        </div>

        {/* 가로 날짜 선택기 */}
        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {dates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center min-w-[64px] h-24 rounded-3xl transition-all ${
                isSameDay(selectedDate, date) 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter mb-1">
                {format(date, "EEE", { locale: ko })}
              </span>
              <span className="text-lg font-black">{format(date, "d")}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="px-6">
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-xl font-black text-slate-900 italic underline decoration-indigo-200 underline-offset-8">Time Slots</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100">
             {availableSlots.length} available
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {availableSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`h-16 rounded-2xl font-bold flex items-center justify-center border-2 transition-all ${
                selectedTime === time
                  ? "bg-white border-indigo-500 text-indigo-600 shadow-lg shadow-indigo-50"
                  : "bg-white border-transparent text-slate-600 shadow-sm"
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        {/* 노쇼 방지 알림 */}
        <div className="mt-10 p-6 bg-red-50 rounded-[32px] border border-red-100 border-dashed">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-xs font-black text-red-900 uppercase tracking-tight">No-Show Prevention</p>
          </div>
          <p className="text-[13px] text-red-700 leading-relaxed font-medium">
            예약 후 방문하지 않으실 경우, 향후 해당 업체 및 연동된 서비스 이용이 제한될 수 있습니다. 
          </p>
        </div>
      </main>

      {/* 고정 하단 결제/예약 버튼 */}
      <div className="fixed bottom-0 max-w-md w-full p-6 pb-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <button 
          disabled={!selectedTime}
          className={`w-full h-18 py-5 rounded-[28px] font-black text-lg shadow-2xl transition-all transform active:scale-95 ${
            selectedTime 
              ? "bg-slate-900 text-white shadow-slate-300" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {selectedTime ? `${selectedTime} 예약하기` : "시간을 선택해 주세요"}
        </button>
      </div>
    </div>
  );
}
