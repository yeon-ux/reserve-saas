"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, X, Save, Clock, Coffee, CheckCircle2, ChevronRight, Settings, Calendar, Utensils, AlertCircle, User } from "lucide-react";

type DayConfig = { id?: number; partner_id: string; day_of_week: number; start_time: string; end_time: string; interval_minutes: number; on: boolean; max_capacity: number };
type Break = { id?: number; start_time: string; end_time: string; label: string; day_of_week: number };

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function AdminSchedulePage() {
  const [activeTab, setActiveTab] = useState<'hours' | 'services' | 'exceptions'>('hours');
  const [days, setDays] = useState<(DayConfig & { name: string })[]>(
    DAY_NAMES.map((name, idx) => ({ name, day_of_week: idx, on: false, start_time: "10:00", end_time: "22:00", interval_minutes: 60, partner_id: "", max_capacity: 1 }))
  );
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [services, setServices] = useState<{ id: string, name: string, price: string }[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. 파트너 정보 (Services) 가져오기
      const { data: partnerData } = await supabase
        .from('partners')
        .select('services')
        .eq('id', user.id)
        .single();
      
      if (partnerData?.services) {
         setServices(partnerData.services);
      } else if (!partnerData?.services) {
         // 기본 예시 서비스 추가 (미용실 예시)
         setServices([
            { id: crypto.randomUUID(), name: "커트 (일반)", price: "15,000" },
            { id: crypto.randomUUID(), name: "펌 (일반)", price: "50,000" }
         ]);
      }

      // 2. 운영 시간 가져오기
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

      // 3. 휴게 시간 가져오기
      const { data: breakData } = await supabase
        .from('breaks')
        .select('*')
        .eq('partner_id', user.id);
      
      if (breakData) {
        const uniqueBreaks = breakData.filter((b, index, self) =>
          index === self.findIndex((t) => (
            t.label === b.label && t.start_time === b.start_time && t.end_time === b.end_time
          ))
        );
        setBreaks(uniqueBreaks);
      }

      // 4. 예외 일정 가져오기
      const { data: exceptionData } = await supabase
        .from('schedule_exceptions')
        .select('*')
        .eq('partner_id', user.id);
      if (exceptionData) setExceptions(exceptionData);
      
      setIsLoading(false);
    }
    fetchData();
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
      // 1. 서비스/메뉴 동기화
      await supabase.from('partners').update({ services }).eq('id', user.id);

      // 2. 운영 시간 동기화 (max_capacity 포함)
      await supabase.from('schedules').delete().eq('partner_id', user.id);
      const activeSchedules = days
        .filter(d => d.on)
        .map(({ name, on, id, ...rest }) => ({ ...rest, partner_id: user.id }));
      if (activeSchedules.length > 0) {
        await supabase.from('schedules').insert(activeSchedules);
      }

      // 3. 휴게 시간 동기화
      await supabase.from('breaks').delete().eq('partner_id', user.id);
      if (breaks.length > 0) {
        const allDayBreaks = [];
        for (let day = 0; day <= 6; day++) {
          for (const b of breaks) {
            const { id, ...rest } = b as any;
            allDayBreaks.push({ ...rest, partner_id: user.id, day_of_week: day });
          }
        }
        await supabase.from('breaks').insert(allDayBreaks);
      }

      // 4. 예외 일정 동기화
      await supabase.from('schedule_exceptions').delete().eq('partner_id', user.id);
      if (exceptions.length > 0) {
         const cleanExceptions = exceptions.map(({ id, ...rest }) => ({ ...rest, partner_id: user.id }));
         await supabase.from('schedule_exceptions').insert(cleanExceptions);
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
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen pb-32 font-['Outfit']">
      <header className="mb-12 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-3 uppercase tracking-widest">
            <Clock size={16} />
            <span>Operational Management</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">근무 및 서비스 설정</h1>
        </div>

        <div className="flex p-1.5 bg-white border border-slate-100 rounded-[24px] shadow-sm">
          <button 
            onClick={() => setActiveTab('hours')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-[20px] text-sm font-black transition-all ${
              activeTab === 'hours' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Clock size={18} />
            <span>운영 시간</span>
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-[20px] text-sm font-black transition-all ${
              activeTab === 'services' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Utensils size={18} />
            <span>서비스 & 수용량</span>
          </button>
          <button 
            onClick={() => setActiveTab('exceptions')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-[20px] text-sm font-black transition-all ${
              activeTab === 'exceptions' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar size={18} />
            <span>특수 일정</span>
          </button>
        </div>
      </header>

      {activeTab === 'hours' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <section className="glass-card p-10 rounded-[48px] shadow-2xl relative overflow-hidden bg-white">
            <h2 className="text-2xl font-black mb-8 flex items-center">
              <span className="w-2.5 h-10 bg-indigo-600 rounded-full mr-4"></span>
              주간 영업 시간
            </h2>
            <div className="space-y-4">
              {days.map((day, idx) => (
                <div key={day.name} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[32px] transition-all border gap-4 ${day.on ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-slate-100 opacity-60'}`}>
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
                    <div className="flex items-center space-x-5">
                      <button 
                        onClick={() => toggleDay(idx)}
                        className={`w-16 h-9 rounded-full p-1.5 transition-all duration-300 ${day.on ? 'bg-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-200'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 transform ${day.on ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                      <span className={`text-2xl font-black ${day.on ? 'text-indigo-900' : 'text-slate-400'}`}>{day.name}</span>
                    </div>
                    {day.on && (
                      <div className="flex items-center space-x-2 ml-4">
                        <User size={14} className="text-indigo-400" />
                        <input 
                          type="number"
                          value={day.max_capacity}
                          min={1}
                          onChange={(e) => {
                            const newDays = [...days];
                            newDays[idx].max_capacity = parseInt(e.target.value) || 1;
                            setDays(newDays);
                          }}
                          className="w-12 bg-white border border-indigo-100 rounded-xl px-2 py-1 text-sm font-black text-indigo-700 outline-none text-center"
                        />
                      </div>
                    )}
                  </div>
                  
                  {day.on && (
                    <div className="flex items-center justify-center sm:justify-end space-x-3 w-full sm:w-auto">
                      <input 
                        type="time" 
                        value={day.start_time.substring(0,5)} 
                        onChange={(e) => {
                          const newDays = [...days];
                          newDays[idx].start_time = e.target.value;
                          setDays(newDays);
                        }}
                        className="bg-white border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none text-center" 
                      />
                      <span className="text-slate-300 font-black px-1">~</span>
                      <input 
                        type="time" 
                        value={day.end_time.substring(0,5)} 
                        onChange={(e) => {
                          const newDays = [...days];
                          newDays[idx].end_time = e.target.value;
                          setDays(newDays);
                        }}
                        className="bg-white border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none text-center" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-10 rounded-[48px] shadow-xl relative overflow-hidden bg-white">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black flex items-center">
                <span className="w-2.5 h-10 bg-orange-500 rounded-full mr-4"></span>
                정기 휴게 시간 (Global)
              </h2>
              <button 
                onClick={addBreak}
                className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-4 rounded-3xl text-sm font-black hover:scale-105 transition-all shadow-xl"
              >
                <Plus size={20} />
                <span>추가하기</span>
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {breaks.map((b, i) => (
                <div key={i} className="group p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 hover:border-orange-200 transition-all relative">
                  <div className="flex items-center justify-between mb-6">
                    <input 
                      type="text" 
                      value={b.label}
                      onChange={(e) => {
                        const newBreaks = [...breaks];
                        newBreaks[i].label = e.target.value;
                        setBreaks(newBreaks);
                      }}
                      className="bg-transparent border-none outline-none font-black text-slate-900 text-xl w-full"
                    />
                    <button onClick={() => removeBreak(i)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={24} /></button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Coffee size={18} className="text-orange-400" />
                    <input 
                      type="time" 
                      value={b.start_time.substring(0,5)}
                      onChange={(e) => {
                        const newBreaks = [...breaks];
                        newBreaks[i].start_time = e.target.value;
                        setBreaks(newBreaks);
                      }}
                      className="bg-white border border-slate-100 rounded-2xl p-3 text-sm font-black text-slate-700 shadow-sm"
                    />
                    <span className="text-slate-300 font-black">~</span>
                    <input 
                      type="time" 
                      value={b.end_time.substring(0,5)}
                      onChange={(e) => {
                        const newBreaks = [...breaks];
                        newBreaks[i].end_time = e.target.value;
                        setBreaks(newBreaks);
                      }}
                      className="bg-white border border-slate-100 rounded-2xl p-3 text-sm font-black text-slate-700 shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <section className="glass-card p-10 rounded-[48px] shadow-2xl bg-white">
              <div className="flex justify-between items-center mb-10">
                 <div>
                   <h2 className="text-2xl font-black flex items-center">
                     <span className="w-2.5 h-10 bg-violet-600 rounded-full mr-4"></span>
                     서비스 및 메뉴 관리
                   </h2>
                   <p className="text-slate-400 font-bold text-sm mt-1 ml-6">예약자가 선택할 수 있는 품목과 가격을 구성하세요.</p>
                 </div>
                 <button 
                  onClick={() => setServices([...services, { id: crypto.randomUUID(), name: "", price: "" }])}
                  className="bg-slate-900 text-white px-6 py-4 rounded-3xl text-sm font-black flex items-center gap-2"
                 >
                   <Plus size={20} />
                   <span>메뉴 추가</span>
                 </button>
              </div>

              <div className="grid gap-4">
                 {services.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                       <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500">{i+1}</span>
                       <input 
                         placeholder="메뉴명 (예: 남성 컷트)" 
                         value={s.name}
                         onChange={(e) => {
                           const newServices = [...services];
                           newServices[i].name = e.target.value;
                           setServices(newServices);
                         }}
                         className="flex-1 bg-transparent border-none font-black text-slate-900 outline-none p-2 text-lg"
                       />
                       <div className="relative">
                          <input 
                            placeholder="가격 (예: 15,000)" 
                            value={s.price}
                            onChange={(e) => {
                              const newServices = [...services];
                              newServices[i].price = e.target.value;
                              setServices(newServices);
                            }}
                            className="w-32 bg-white border border-slate-100 rounded-2xl px-4 py-3 text-right font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                          <span className="absolute right-[-1.5rem] top-1/2 -translate-y-1/2 font-bold text-slate-300">원</span>
                       </div>
                       <button onClick={() => setServices(services.filter(item => item.id !== s.id))} className="ml-4 p-3 text-slate-200 hover:text-red-500 transition-all">
                          <X size={24} />
                       </button>
                    </div>
                 ))}
                 {services.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[40px]">
                       <p className="text-slate-300 font-black">등록된 서비스가 없습니다.</p>
                    </div>
                 )}
              </div>
           </section>

           <div className="p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100 flex items-start gap-4">
              <AlertCircle className="text-indigo-400 shrink-0 mt-1" />
              <div>
                 <h4 className="font-black text-indigo-900">사용 팁</h4>
                 <p className="text-sm text-indigo-600 font-bold leading-relaxed mt-1">기본값은 '1시간당 1명' 예약입니다. 수용 인원을 늘리면 같은 시간에 여러 명의 중복 예약을 받을 수 있습니다.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'exceptions' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <section className="glass-card p-10 rounded-[48px] shadow-2xl bg-white">
              <div className="flex justify-between items-center mb-10">
                 <div>
                   <h2 className="text-2xl font-black flex items-center">
                     <span className="w-2.5 h-10 bg-rose-500 rounded-full mr-4"></span>
                     날짜별 특수 일정 (Overrides)
                   </h2>
                   <p className="text-slate-400 font-bold text-sm mt-1 ml-6">특정 날짜의 영업 시간을 변경하거나 휴무를 설정하세요.</p>
                 </div>
                 <button 
                  onClick={() => setExceptions([...exceptions, { id: Math.random().toString(36).substring(2, 11), exception_date: format(new Date(), "yyyy-MM-dd"), start_time: "10:00", end_time: "22:00", is_closed: false }])}
                  className="bg-slate-900 text-white px-6 py-4 rounded-3xl text-sm font-black flex items-center gap-2"
                 >
                   <Plus size={20} />
                   <span>예외 추가</span>
                 </button>
              </div>

              <div className="grid gap-6">
                 {exceptions.map((ex, i) => (
                    <div key={ex.id} className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white hover:shadow-xl">
                       <div className="flex items-center gap-6">
                          <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm font-black text-slate-900">
                             <input 
                               type="date" 
                               value={ex.exception_date}
                               onChange={(e) => {
                                  const newEx = [...exceptions];
                                  newEx[i].exception_date = e.target.value;
                                  setExceptions(newEx);
                               }}
                               className="bg-transparent border-none outline-none cursor-pointer"
                             />
                          </div>
                          <div className="flex items-center gap-3">
                             <button 
                               onClick={() => {
                                  const newEx = [...exceptions];
                                  newEx[i].is_closed = !newEx[i].is_closed;
                                  setExceptions(newEx);
                               }}
                               className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${ex.is_closed ? 'bg-rose-500 text-white' : 'bg-green-500 text-white opacity-40'}`}
                             >
                               {ex.is_closed ? '휴무' : '영업'}
                             </button>
                          </div>
                       </div>

                       {!ex.is_closed && (
                          <div className="flex items-center gap-3">
                             <input 
                               type="time" 
                               value={ex.start_time.substring(0,5)}
                               onChange={(e) => {
                                  const newEx = [...exceptions];
                                  newEx[i].start_time = e.target.value;
                                  setExceptions(newEx);
                               }}
                               className="bg-white border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 w-32 text-center"
                             />
                             <span className="text-slate-300 font-black">~</span>
                             <input 
                               type="time" 
                               value={ex.end_time.substring(0,5)}
                               onChange={(e) => {
                                  const newEx = [...exceptions];
                                  newEx[i].end_time = e.target.value;
                                  setExceptions(newEx);
                               }}
                               className="bg-white border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 w-32 text-center"
                             />
                          </div>
                       )}

                       <button onClick={() => setExceptions(exceptions.filter(item => item.id !== ex.id))} className="p-4 text-slate-200 hover:text-red-500 transition-all">
                          <X size={24} />
                       </button>
                    </div>
                 ))}
                 {exceptions.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[40px]">
                       <p className="text-slate-300 font-black">설정된 예외 일정이 없습니다.</p>
                       <p className="text-xs text-slate-300 mt-2">주야간 교대나 공휴일 영업 등을 이곳에서 관리하세요.</p>
                    </div>
                 )}
              </div>
           </section>
        </div>
      )}

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
