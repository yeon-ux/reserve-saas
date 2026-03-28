"use client";
export const runtime = 'edge';


import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { calculateFinalSlots, WorkConfig, TimeRange, ReservationEvent } from "../../lib/filtering";
import { format, addDays, isSameDay, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import AdBanner from "../../components/AdBanner";

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

  // 예약 신청 서적 상태
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const [isBlocked, setIsBlocked] = useState(false);
  const [isCheckingBlacklist, setIsCheckingBlacklist] = useState(false);
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  
  const [scheduleExceptions, setScheduleExceptions] = useState<any[]>([]);

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

  // 해당 날짜의 기존 예약 목록 가져오기
  useEffect(() => {
    if (!partner) return;
    
    async function fetchReservationsAndExceptions() {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // 1. 예약 현황 가져오기 (각 슬롯별 예약 수 카운트를 위해 전체 데이터 로드)
      const { data: resData } = await supabase
        .from('reservations')
        .select('reserved_at')
        .eq('partner_id', partner.id)
        .gte('reserved_at', `${dateStr}T00:00:00`)
        .lte('reserved_at', `${dateStr}T23:59:59`)
        .neq('status', 'cancelled');
      
      if (resData) {
        setReservations(resData.map(r => format(new Date(r.reserved_at), "HH:mm")));
      }

      // 2. 해당 날짜의 예외 운영 시간 가져오기
      const { data: exData } = await supabase
         .from('schedule_exceptions')
         .select('*')
         .eq('partner_id', partner.id)
         .eq('exception_date', dateStr);
      setScheduleExceptions(exData || []);
    }
    fetchReservationsAndExceptions();
  }, [selectedDate, partner]);

  // 블랙리스트 체크 (사용자가 번호를 완전히 입력했을 때)
  useEffect(() => {
    if (customerPhone.length >= 10 && partner) {
      import("../../lib/blacklist").then(async ({ checkIsBlacklisted }) => {
        setIsCheckingBlacklist(true);
        const blocked = await checkIsBlacklisted(supabase, customerPhone);
        setIsBlocked(blocked);
        setIsCheckingBlacklist(false);
      });
    } else {
      setIsBlocked(false);
    }
  }, [customerPhone, partner]);

  // 날짜 선택 시 가용 시간 계산 (필터링 엔진 적용)
  useEffect(() => {
    if (!partner) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayOfWeek = getDay(selectedDate);
    
    // 1. 기본 운영 시간 또는 예외 운영 시간 결정
    let currentWorkConfig = workConfigs[dayOfWeek] || null;
    const exception = scheduleExceptions.find(ex => ex.exception_date === dateStr);
    
    if (exception) {
       if (exception.is_closed) {
          setAvailableSlots([]);
          return;
       }
       currentWorkConfig = {
          startTime: exception.start_time,
          endTime: exception.end_time,
          interval: currentWorkConfig?.interval || 60
       };
    }

    if (!currentWorkConfig) {
       setAvailableSlots([]);
       return;
    }

    // 2. 슬롯 생성 및 필터링
    const rawSlots = calculateFinalSlots(
      dateStr,
      dayOfWeek,
      currentWorkConfig,
      breaks,
      holidays,
      events,
      [] // 예약 필터링은 수용량 체크를 위해 여기서 별도로 수행
    );
    
    // 3. 중복 예약(수용량) 체크
    // schedules 테이블에서 해당 요일의 max_capacity 가져오기 (기본값 1)
    const maxCap = workConfigs[dayOfWeek]?.max_capacity || 1;
    
    const finalSlots = rawSlots.filter(slot => {
       const currentCount = reservations.filter(r => r === slot).length;
       return currentCount < maxCap;
    });
    
    setAvailableSlots(finalSlots);
  }, [selectedDate, partner, workConfigs, breaks, holidays, events, reservations, scheduleExceptions]);

  const handleBooking = async () => {
    if (!selectedTime || !customerName || !customerPhone || isBlocked || !hasAgreedTerms) return;

    setIsSubmitLoading(true);
    try {
      const reservedAt = `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00Z`;
      
      const { error } = await supabase
        .from('reservations')
        .insert([{
          partner_id: partner.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_memo: memo,
          selected_service: selectedService,
          reserved_at: reservedAt,
          status: 'pending'
        }]);
      
      if (error) throw error;

      alert("예약이 완료되었습니다!");
      setIsBookingModalOpen(false);
      setSelectedTime(null);
      // 예약 목록 새로고침 유도
      setReservations([...reservations, selectedTime]);
    } catch (err: any) {
      alert("예약 중 오류: " + err.message);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (!partner) return <div className="p-10 text-center font-bold text-slate-400">명함을 불러오는 중...</div>;

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-40 text-slate-900">
      <div className="px-4 pt-4">
        <AdBanner slot="booking-header" />
      </div>

      <header className="p-8 pb-6 bg-white rounded-b-[48px] shadow-sm mb-6">
        <div className="flex items-center space-x-5 mb-8">
          <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 uppercase">
            {partner.profile_img ? <img src={partner.profile_img} className="w-full h-full object-cover rounded-[24px]" /> : partner.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{partner.name}</h1>
            <p className="text-slate-400 text-sm font-bold mt-1 tracking-tight">{partner.bio || "환영합니다! 예약을 진행해 주세요."}</p>
          </div>
        </div>

        <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar">
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
          {availableSlots.length === 0 && (
            <div className="col-span-3 py-10 text-center text-slate-300 font-bold bg-white rounded-[32px] border-2 border-dashed border-slate-100">
              가능한 시간이 없습니다.
            </div>
          )}
        </div>

        <div className="mt-10 p-6 bg-red-50 rounded-[32px] border border-red-100 border-dashed">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-xs font-black text-red-900 uppercase tracking-tight">No-Show Prevention</p>
          </div>
          <p className="text-[13px] text-red-700 leading-relaxed font-medium">
            예약 후 방문하지 않으실 경우, 향후 해당 업체 및 연동된 서비스 이용이 영구 제한될 수 있습니다. 
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 max-w-md w-full p-6 pb-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <button 
          onClick={() => setIsBookingModalOpen(true)}
          disabled={!selectedTime}
          className={`w-full h-20 rounded-[32px] font-black text-xl shadow-2xl transition-all transform active:scale-95 ${
            selectedTime 
              ? "bg-slate-900 text-white shadow-slate-300" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed text-base font-bold"
          }`}
        >
          {selectedTime ? `${selectedTime} 예약 고정하기` : "시간을 선택해 주세요"}
        </button>
      </div>

      {/* 예약 신청 모달 */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[48px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">예약자 정보 입력</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {isBlocked ? (
              <div className="p-8 bg-red-50 rounded-[32px] border border-red-100 text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚫</span>
                </div>
                <h4 className="text-xl font-black text-red-900 mb-2">예약 제한 사용자</h4>
                <p className="text-red-600 text-sm font-bold leading-relaxed">
                  반복적인 노쇼 이력으로 인해<br/>이 파트너에 대한 예약이 제한되었습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Personal Info</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="예약자 성함" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-700 placeholder:text-slate-300" 
                      />
                      <div className="relative">
                        <input 
                          type="tel" 
                          placeholder="연락처 (숫자만)" 
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-700 placeholder:text-slate-300" 
                        />
                        {isCheckingBlacklist && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {partner.services && partner.services.length > 0 && (
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Service Selection</label>
                      <div className="grid gap-2">
                        {partner.services.map((s: any) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedService(s.name)}
                            className={`p-5 rounded-2xl border-2 transition-all flex justify-between items-center text-left ${
                              selectedService === s.name 
                                ? "bg-indigo-50 border-indigo-500 ring-4 ring-indigo-50" 
                                : "bg-white border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <span className={`font-black ${selectedService === s.name ? "text-indigo-900" : "text-slate-700"}`}>{s.name}</span>
                            <span className="text-sm font-bold text-indigo-500">{s.price}원</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Request Memo</label>
                    <textarea 
                      placeholder="요청사항이나 메모를 남겨주세요 (선택)"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-700 placeholder:text-slate-300 min-h-[120px] resize-none"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-50">
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      id="antiNoShow" 
                      checked={hasAgreedTerms}
                      onChange={() => setHasAgreedTerms(!hasAgreedTerms)}
                      className="mt-1.5 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="antiNoShow" className="text-sm text-slate-600 leading-snug font-bold cursor-pointer">
                      <span className="text-indigo-600 font-black">[필수]</span> 노쇼 방지 정책 동의
                      <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">무단 예약 부도(노쇼) 시 향후 서비스 이용이 불가능해질 수 있으며, 변경 사항은 사전에 해당 업체로 연락해야 합니다.</p>
                    </label>
                  </div>
                </div>

                <button
                  disabled={!customerName || customerPhone.length < 10 || !hasAgreedTerms || isSubmitLoading || (partner.services?.length > 0 && !selectedService)}
                  onClick={handleBooking}
                  className="w-full h-20 bg-slate-900 text-white rounded-[32px] font-black text-xl shadow-2xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center p-4 sticky bottom-0"
                >
                  {isSubmitLoading ? <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "예약 확정하기"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
