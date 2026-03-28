"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Calendar, User, Phone, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
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

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold text-slate-400">명단을 불러오는 중...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen pb-32">
      <header className="mb-12 pt-8">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-2 uppercase tracking-widest">
          <Calendar size={16} />
          <span>Booking Management</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">예약 관리 및 명단</h1>
      </header>

      <div className="grid gap-6">
        {reservations.map((r) => (
          <div key={r.id} className={`glass-card p-6 rounded-[32px] border-2 transition-all ${r.no_show_at ? 'bg-red-50 border-red-100' : 'bg-white border-white shadow-sm'}`}>
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
                  <div className="flex items-center space-x-3 mt-1 text-slate-400 font-bold text-sm">
                    <div className="flex items-center space-x-1">
                      <Phone size={14} />
                      <span>{r.customer_phone}</span>
                    </div>
                    <span className="text-slate-200">|</span>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{format(new Date(r.reserved_at), "yyyy-MM-dd HH:mm", { locale: ko })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <select 
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value as any)}
                  className={`border-none rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-200 ${
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
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    r.no_show_at 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-100' 
                      : 'bg-white border border-red-200 text-red-500 hover:bg-red-50'
                  }`}
                >
                  {r.no_show_at ? '노쇼 취소' : '노쇼 신고'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {reservations.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <XCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">아직 접수된 예약이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
