"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdSenseBanner from "@/components/AdSenseBanner";
import { format, addDays, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";

export default function ReservationPage({ params }: { params: { slug: string } }) {
  const [partner, setPartner] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPartner() {
      const { data } = await supabase
        .from('partners')
        .select('*')
        .eq('slug', params.slug)
        .single();
      setPartner(data);
    }
    fetchPartner();
  }, [params.slug]);

  // 날짜 선택 시 가용 시간 계산 (Phase 5 엔진 로직 반영 시뮬레이션)
  useEffect(() => {
    if (!partner) return;
    // 실제로는 API나 Supabase RPC를 통해 가용 시간을 가져옵니다.
    const slots = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    setAvailableSlots(slots);
  }, [selectedDate, partner]);

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
