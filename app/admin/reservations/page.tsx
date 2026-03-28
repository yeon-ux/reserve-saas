"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, User, Phone, CheckCircle2, AlertCircle, XCircle, Clock, List, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from "date-fns";
import { ko } from "date-fns/locale";

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  reserved_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  no_show_at: string | null;
  created_at: string;
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    async function fetchReservations(userId: string) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('partner_id', userId)
        .order('reserved_at', { ascending: false });
      
      if (data) setReservations(data);
      setIsLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchReservations(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        router.push("/login");
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchReservations(user.id);
      } else {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleMarkNoShow = async (id: string, currentNoShow: string | null) => {
    const newNoShow = currentNoShow ? null : new Date().toISOString();
    const message = currentNoShow ? "노쇼 표시를 취소하시겠습니까?" : "이 예약을 노쇼(No-Show)로 표시하시겠습니까?\n해당 고객의 노쇼 횟수가 누적됩니다.";
    
    if (!confirm(message)) return;

    const { error } = await supabase
      .from('reservations')
      .update({ no_show_at: newNoShow })
      .eq('id', id);
    
    if (!error) {
      setReservations(reservations.map(r => r.id === id ? { ...r, no_show_at: newNoShow } : r));
    } else {
      alert("업데이트 실패: " + error.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Reservation['status']) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      setReservations(reservations.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-indigo-50/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-90"
            >
              오늘
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
            <div key={day} className={`py-4 text-center text-xs font-black tracking-widest ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-indigo-400' : 'text-slate-400'}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayReservations = reservations.filter(r => isSameDay(parseISO(r.reserved_at), day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[140px] p-4 border-r border-b border-slate-50 transition-colors hover:bg-slate-50/50 group ${!isCurrentMonth ? 'bg-slate-50/30 opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-black ${
                    isToday ? 'bg-indigo-600 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-lg shadow-indigo-100' : 
                    idx % 7 === 0 ? 'text-red-400' : idx % 7 === 6 ? 'text-indigo-400' : 'text-slate-400'
                  }`}>
                    {format(day, "d")}
                  </span>
                  {dayReservations.length > 0 && (
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                      {dayReservations.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayReservations.slice(0, 3).map(r => (
                    <div 
                      key={r.id} 
                      className={`text-[10px] p-1.5 rounded-lg font-black truncate border ${
                        r.status === 'confirmed' ? 'bg-green-50 border-green-100 text-green-700' : 
                        r.status === 'cancelled' ? 'bg-slate-50 border-slate-100 text-slate-400 line-through' : 
                        'bg-indigo-50 border-indigo-100 text-indigo-700'
                      }`}
                    >
                      {format(parseISO(r.reserved_at), "HH:mm")} {r.customer_name}
                    </div>
                  ))}
                  {dayReservations.length > 3 && (
                    <p className="text-[9px] font-bold text-slate-300 pl-1 mt-1">외 {dayReservations.length - 3}건...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">명단을 불러오는 중...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen pb-32 font-['Outfit']">
      <header className="mb-12 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-3 uppercase tracking-widest">
            <CalendarIcon size={16} />
            <span>Booking Management</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">예약 현황</h1>
        </div>

        <div className="flex p-1.5 bg-white border border-slate-100 rounded-[24px] shadow-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-[20px] text-sm font-black transition-all ${
              viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={18} />
            <span>리스트</span>
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-[20px] text-sm font-black transition-all ${
              viewMode === 'calendar' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CalendarIcon size={18} />
            <span>달력</span>
          </button>
        </div>
      </header>

      {viewMode === 'calendar' ? renderCalendar() : (
        <div className="grid gap-6">
          {reservations.map((r) => (
            <div key={r.id} className={`glass-card p-6 rounded-[32px] border-2 transition-all hover:scale-[1.01] ${r.no_show_at ? 'bg-red-50 border-red-100' : 'bg-white border-white shadow-sm'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${r.no_show_at ? 'bg-red-100 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
                    <User size={28} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-black text-slate-900">{r.customer_name}</h3>
                      {r.no_show_at && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest animate-pulse">No-Show</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-slate-400 font-bold text-sm">
                      <div className="flex items-center space-x-1.5">
                        <Phone size={14} className="text-slate-300" />
                        <span>{r.customer_phone}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock size={14} className="text-slate-300" />
                        <span className="text-indigo-600 font-black">{format(new Date(r.reserved_at), "yyyy-MM-dd HH:mm", { locale: ko })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select 
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as any)}
                    className={`border-none rounded-2xl px-5 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer ${
                      r.status === 'confirmed' ? 'bg-green-50 text-green-600' : 
                      r.status === 'cancelled' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    <option value="pending">대기 중</option>
                    <option value="confirmed">확정됨</option>
                    <option value="cancelled">취소됨</option>
                  </select>

                  <button 
                    onClick={() => handleMarkNoShow(r.id, r.no_show_at)}
                    className={`px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                      r.no_show_at 
                        ? 'bg-red-500 text-white shadow-xl shadow-red-100 hover:bg-red-600' 
                        : 'bg-white border border-red-100 text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {r.no_show_at ? '노쇼 취소' : '노쇼 신고'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reservations.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[48px] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black text-lg">아직 접수된 예약이 없습니다.</p>
              <p className="text-slate-300 text-sm font-bold mt-1 tracking-tight">새로운 예약이 들어오면 이곳에 표시됩니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
