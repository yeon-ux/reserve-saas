"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Trash2, Plus, CheckCircle2, AlertCircle } from "lucide-react";

type EventType = 'recurring' | 'single';

type Event = {
  id: number;
  type: EventType;
  title: string;
  day_of_week?: number | null;
  event_date?: string | null;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  // New Event Form State
  const [newType, setNewType] = useState<EventType>('recurring');
  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState(1); // 월요일 default
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("11:00");

  useEffect(() => {
    async function fetchEvents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setEvents(data);
      setIsLoading(false);
    }
    fetchEvents();
  }, [router]);

  const handleAddEvent = async () => {
    if (!newTitle) {
      alert("일정 제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const payload: any = {
        partner_id: user.id,
        type: newType,
        title: newTitle,
        start_time: newStart,
        end_time: newEnd,
        is_active: true
      };

      if (newType === 'recurring') {
        payload.day_of_week = newDay;
        payload.event_date = null;
      } else {
        if (!newDate) {
          alert("날짜를 선택해주세요.");
          return;
        }
        payload.event_date = newDate;
        payload.day_of_week = null;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEvents([data, ...events]);
        setNewTitle("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      alert("저장 중 오류: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("정말 이 일정을 삭제하시겠습니까?")) return;
    
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      setEvents(events.filter(e => e.id !== id));
    } else {
      alert("삭제 실패: " + error.message);
    }
  };

  const toggleEventStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('events')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setEvents(events.map(e => e.id === id ? { ...e, is_active: !currentStatus } : e));
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold text-slate-400">일정을 불러오는 중...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto bg-slate-50 min-h-screen pb-32">
      <header className="mb-12 pt-8">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-2 uppercase tracking-widest">
          <Calendar size={16} />
          <span>Calendar & Events</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">회의 및 일정 차단</h1>
      </header>

      {/* 새 일정 등록 폼 */}
      <section className="glass-card p-8 rounded-[40px] mb-12 bg-white shadow-xl shadow-slate-200/50 border border-white">
        <h2 className="text-xl font-black mb-6 flex items-center">
          <span className="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
          새 일정 등록
        </h2>
        
        <div className="space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setNewType('recurring')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${newType === 'recurring' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
            >
              정기 반복 (매주)
            </button>
            <button 
              onClick={() => setNewType('single')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${newType === 'single' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
            >
              일회성 일정
            </button>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="일정 제목 (예: 주간 회의, 외부 미팅)" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              {newType === 'recurring' ? (
                <select 
                  value={newDay}
                  onChange={(e) => setNewDay(parseInt(e.target.value))}
                  className="bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {DAY_NAMES.map((name, idx) => (
                    <option key={idx} value={idx}>{name}요일</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="date" 
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              )}
              
              <div className="flex items-center space-x-2">
                <input 
                  type="time" 
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-xs font-black text-slate-700"
                />
                <span className="text-slate-300">-</span>
                <input 
                  type="time" 
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-xs font-black text-slate-700"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleAddEvent}
            disabled={isSaving}
            className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={20} />}
            <span>일정 추가하기</span>
          </button>
        </div>
      </section>

      {/* 일정 리스트 */}
      <div className="space-y-8">
        {/* 정기 일정 */}
        <section>
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-2"></span>
            정기 일정
          </h3>
          <div className="space-y-4">
            {events.filter(e => e.type === 'recurring').map((e) => (
              <EventCard key={e.id} event={e} onDelete={handleDeleteEvent} onToggle={toggleEventStatus} />
            ))}
            {events.filter(e => e.type === 'recurring').length === 0 && (
              <p className="text-center py-8 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-3xl">등록된 정기 일정이 없습니다.</p>
            )}
          </div>
        </section>

        {/* 단일 일정 */}
        <section>
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-2"></span>
            개별 일정
          </h3>
          <div className="space-y-4">
            {events.filter(e => e.type === 'single').map((e) => (
              <EventCard key={e.id} event={e} onDelete={handleDeleteEvent} onToggle={toggleEventStatus} />
            ))}
            {events.filter(e => e.type === 'single').length === 0 && (
              <p className="text-center py-8 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-3xl">등록된 단일 일정이 없습니다.</p>
            )}
          </div>
        </section>
      </div>

      {saveSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-black flex items-center space-x-2 animate-bounce">
          <CheckCircle2 size={18} />
          <span>성공적으로 저장되었습니다!</span>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onDelete, onToggle }: { event: Event, onDelete: (id: number) => void, onToggle: (id: number, status: boolean) => void }) {
  return (
    <div className={`p-6 rounded-[32px] border transition-all ${event.is_active ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${event.type === 'recurring' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
            {event.type === 'recurring' ? <Clock size={24} /> : <Calendar size={24} />}
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg leading-tight">{event.title}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {event.type === 'recurring' ? `매주 ${DAY_NAMES[event.day_of_week!]}요일` : event.event_date}
              </span>
              <span className="text-slate-200">|</span>
              <span className="text-xs font-black text-indigo-600">{event.start_time.substring(0,5)} - {event.end_time.substring(0,5)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onToggle(event.id, event.is_active)}
            className={`w-12 h-6 rounded-full p-1 transition-all ${event.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${event.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <button 
            onClick={() => onDelete(event.id)}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
