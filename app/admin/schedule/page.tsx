"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type DayConfig = { id?: number; partner_id: string; day_of_week: number; start_time: string; end_time: string; interval_minutes: number; on: boolean };
type Break = { id?: number; start_time: string; end_time: string; label: string; day_of_week: number };

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function AdminSchedulePage() {
  const [days, setDays] = useState<(DayConfig & { name: string })[]>(
    DAY_NAMES.map((name, idx) => ({ name, day_of_week: idx, on: false, start_time: "10:00", end_time: "22:00", interval_minutes: 60, partner_id: "" }))
  );
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 운영 시간 가져오기
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*')
        .eq('partner_id', user.id);
      
      if (scheduleData) {
        setDays(prev => prev.map(d => {
          const match = scheduleData.find(s => s.day_of_week === d.day_of_week);
          return match ? { ...d, ...match, on: true } : d;
        }));
      }

      // 2. 휴게 시간 가져오기
      const { data: breakData } = await supabase
        .from('breaks')
        .select('*')
        .eq('partner_id', user.id);
      
      if (breakData) setBreaks(breakData);
      
      setIsLoading(false);
    }
    fetchSchedule();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // "on" 되어 있는 것들만 저장 (Upsert)
    const activeSchedules = days
      .filter(d => d.on)
      .map(({ name, on, ...rest }) => ({ ...rest, partner_id: user.id }));
    
    // "off" 된 것들은 삭제 (또는 DB 스키마에 따라 처리)
    const { error } = await supabase
      .from('schedules')
      .upsert(activeSchedules, { onConflict: 'partner_id, day_of_week' });
    
    if (!error) alert("설정이 저장되었습니다!");
  };

  const toggleDay = (idx: number) => {
    const newDays = [...days];
    newDays[idx].on = !newDays[idx].on;
    setDays(newDays);
  };

  if (isLoading) return <div className="p-10 text-center font-bold">로딩 중...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-900">운영 시간 및 휴게 설정</h1>
      
      <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
          영업 요일 및 시간
        </h2>
        <div className="space-y-4">
          {days.map((day, idx) => (
            <div key={day.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => toggleDay(idx)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${day.on ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${day.on ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className="font-bold text-slate-700 w-4">{day.name}</span>
              </div>
              
              {day.on && (
                <div className="flex items-center space-x-2">
                  <input 
                    type="time" 
                    value={day.start_time.substring(0,5)} 
                    onChange={(e) => {
                      const newDays = [...days];
                      newDays[idx].start_time = e.target.value;
                      setDays(newDays);
                    }}
                    className="bg-white border-none rounded-xl p-2 text-sm font-bold shadow-sm" 
                  />
                  <span className="text-slate-300">-</span>
                  <input 
                    type="time" 
                    value={day.end_time.substring(0,5)} 
                    onChange={(e) => {
                      const newDays = [...days];
                      newDays[idx].end_time = e.target.value;
                      setDays(newDays);
                    }}
                    className="bg-white border-none rounded-xl p-2 text-sm font-bold shadow-sm" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold flex items-center">
            <span className="w-1.5 h-6 bg-orange-400 rounded-full mr-2"></span>
            정기 휴게 시간 (브레이크)
          </h2>
          <button className="text-indigo-600 text-sm font-bold">+ 추가</button>
        </div>
        <div className="space-y-3">
          {breaks.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <span className="font-bold text-orange-900">{b.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-orange-700">{b.start_time.substring(0,5)} - {b.end_time.substring(0,5)}</span>
                <button className="text-orange-300 ml-2">×</button>
              </div>
            </div>
          ))}
          {breaks.length === 0 && <p className="text-center py-6 text-slate-400 text-sm">등록된 휴게 시간이 없습니다.</p>}
        </div>
      </section>

      <button 
        onClick={handleSave}
        className="w-full h-16 bg-slate-900 text-white rounded-3xl font-bold mt-8 shadow-xl shadow-slate-200 active:scale-95 transition-all"
      >
        설정 저장하기
      </button>
    </div>
  );
}
