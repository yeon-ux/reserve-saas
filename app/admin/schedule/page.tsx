"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Save, Clock, Coffee, CheckCircle2, ChevronRight } from "lucide-react";

type DayConfig = { id?: number; partner_id: string; day_of_week: number; start_time: string; end_time: string; interval_minutes: number; on: boolean };
type Break = { id?: number; start_time: string; end_time: string; label: string; day_of_week: number };

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function AdminSchedulePage() {
  const [days, setDays] = useState<(DayConfig & { name: string })[]>(
    DAY_NAMES.map((name, idx) => ({ name, day_of_week: idx, on: false, start_time: "10:00", end_time: "22:00", interval_minutes: 60, partner_id: "" }))
  );
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchSchedule() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

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

      // 2. 휴게 시간 가져오기 (전체 가져온 후 UI를 위해 중복 제거 - Global 설정 방식)
      const { data: breakData } = await supabase
        .from('breaks')
        .select('*')
        .eq('partner_id', user.id);
      
      if (breakData) {
        // 라벨, 시작시간, 종료시간이 같으면 동일한 글로벌 휴게시간으로 간주
        const uniqueBreaks = breakData.filter((b, index, self) =>
          index === self.findIndex((t) => (
            t.label === b.label && t.start_time === b.start_time && t.end_time === b.end_time
          ))
        );
        setBreaks(uniqueBreaks);
      }
      
      setIsLoading(false);
    }
    fetchSchedule();
  }, [router]);

  const addBreak = () => {
    setBreaks([...breaks, { label: "식사 시간", start_time: "12:00", end_time: "13:00", day_of_week: 0 }]); // 기본값 0(일요일)으로 설정 (저장 시 전 요일 복제됨)
  };

  const removeBreak = (idx: number) => {
    setBreaks(breaks.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // 1. 운영 시간 동기화 (기존 삭제 후 활성 항목 삽입)
      await supabase.from('schedules').delete().eq('partner_id', user.id);
      
      const activeSchedules = days
        .filter(d => d.on)
        .map(({ name, on, id, ...rest }) => ({ ...rest, partner_id: user.id }));
      
      if (activeSchedules.length > 0) {
        await supabase.from('schedules').insert(activeSchedules);
      }

      // 2. 휴게 시간 동기화 (Global Breaks -> 모든 요일에 대해 저장)
      await supabase.from('breaks').delete().eq('partner_id', user.id);
      if (breaks.length > 0) {
        // 중복 제거 및 모든 요일(0-6)로 복제하여 저장
        const allDayBreaks = [];
        for (let day = 0; day <= 6; day++) {
          for (const b of breaks) {
            const { id, ...rest } = b;
            allDayBreaks.push({ 
              ...rest, 
              partner_id: user.id, 
              day_of_week: day 
            });
          }
        }
        await supabase.from('breaks').insert(allDayBreaks);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (idx: number) => {
    const newDays = [...days];
    newDays[idx].on = !newDays[idx].on;
    setDays(newDays);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold text-slate-400">설정을 불러오는 중...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto bg-slate-50 min-h-screen pb-32">
      <header className="mb-12 pt-8">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-2 uppercase tracking-widest">
          <Clock size={16} />
          <span>Availability Settings</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">운영 시간 및 휴게</h1>
      </header>
      
      <section className="glass-card p-8 rounded-[40px] mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black flex items-center">
            <span className="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
            영업 요일 및 시간
          </h2>
        </div>
        
        <div className="space-y-4">
          {days.map((day, idx) => (
            <div key={day.name} className={`flex items-center justify-between p-5 rounded-3xl transition-all border ${day.on ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100 opacity-60'}`}>
              <div className="flex items-center space-x-5">
                <button 
                  onClick={() => toggleDay(idx)}
                  className={`w-14 h-8 rounded-full p-1.5 transition-all duration-300 ${day.on ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${day.on ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className={`text-xl font-black ${day.on ? 'text-indigo-900' : 'text-slate-400'}`}>{day.name}</span>
              </div>
              
              {day.on && (
                <div className="flex items-center space-x-3">
                  <input 
                    type="time" 
                    value={day.start_time.substring(0,5)} 
                    onChange={(e) => {
                      const newDays = [...days];
                      newDays[idx].start_time = e.target.value;
                      setDays(newDays);
                    }}
                    className="bg-white border-none rounded-2xl p-3 text-sm font-black text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                  <span className="text-slate-300 font-bold">-</span>
                  <input 
                    type="time" 
                    value={day.end_time.substring(0,5)} 
                    onChange={(e) => {
                      const newDays = [...days];
                      newDays[idx].end_time = e.target.value;
                      setDays(newDays);
                    }}
                    className="bg-white border-none rounded-2xl p-3 text-sm font-black text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-8 rounded-[40px] relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black flex items-center">
            <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
            정기 휴게 시간
          </h2>
          <button 
            onClick={addBreak}
            className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-black hover:scale-105 transition-all active:scale-95 shadow-lg"
          >
            <Plus size={18} />
            <span>추가</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {breaks.map((b, i) => (
            <div key={i} className="group flex flex-col p-6 bg-orange-50/50 rounded-3xl border border-orange-100 hover:border-orange-300 transition-all">
              <div className="flex items-center justify-between mb-4">
                <input 
                  type="text" 
                  value={b.label}
                  onChange={(e) => {
                    const newBreaks = [...breaks];
                    newBreaks[i].label = e.target.value;
                    setBreaks(newBreaks);
                  }}
                  placeholder="항목 예: 점심 시간"
                  className="bg-transparent border-none outline-none font-black text-orange-900 text-lg placeholder:text-orange-200 w-full"
                />
                <button 
                  onClick={() => removeBreak(i)}
                  className="text-orange-300 hover:text-red-500 transition-colors p-1"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <Coffee size={16} className="text-orange-400" />
                <input 
                  type="time" 
                  value={b.start_time.substring(0,5)}
                  onChange={(e) => {
                    const newBreaks = [...breaks];
                    newBreaks[i].start_time = e.target.value;
                    setBreaks(newBreaks);
                  }}
                  className="bg-white border-none rounded-xl p-2 text-sm font-black text-orange-900 shadow-sm"
                />
                <span className="text-orange-300 font-bold">-</span>
                <input 
                  type="time" 
                  value={b.end_time.substring(0,5)}
                  onChange={(e) => {
                    const newBreaks = [...breaks];
                    newBreaks[i].end_time = e.target.value;
                    setBreaks(newBreaks);
                  }}
                  className="bg-white border-none rounded-xl p-2 text-sm font-black text-orange-900 shadow-sm"
                />
              </div>
            </div>
          ))}
          {breaks.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-[32px]">
              <p className="text-slate-400 font-bold">등록된 휴게 시간이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none">
        <div className="max-w-2xl w-full pointer-events-auto">
          {saveSuccess ? (
            <Link 
              href="/admin/reservations"
              className="w-full h-20 bg-indigo-600 text-white rounded-[32px] font-black text-xl shadow-2xl flex items-center justify-center space-x-3 animate-bounce"
            >
              <ChevronRight size={24} />
              <span>예약 명단 보러가기</span>
            </Link>
          ) : (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full h-20 rounded-[32px] font-black text-xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center space-x-3 ${
                isSaving ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white shadow-slate-300'
              }`}
            >
              {isSaving ? (
                <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={24} />
                  <span>설정 저장하기</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
