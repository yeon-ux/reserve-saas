"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Calendar, Plus, X, Trash2, CheckCircle2 } from "lucide-react";

type Holiday = { id: string; holiday_date: string; label: string; is_active: boolean };

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchHolidays() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from('holidays')
        .select('*')
        .eq('partner_id', user.id)
        .order('holiday_date', { ascending: true });
      
      if (data) setHolidays(data);
      setIsLoading(false);
    }
    fetchHolidays();
  }, [router]);

  const addHoliday = async () => {
    if (!newDate || !newLabel) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('holidays')
      .insert([{
        partner_id: user.id,
        holiday_date: newDate,
        label: newLabel,
        is_active: true
      }])
      .select()
      .single();
    
    if (data) {
      setHolidays([...holidays, data].sort((a,b) => a.holiday_date.localeCompare(b.holiday_date)));
      setNewDate("");
      setNewLabel("");
    }
  };

  const toggleHoliday = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('holidays')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setHolidays(holidays.map(h => h.id === id ? { ...h, is_active: !currentStatus } : h));
    }
  };

  const deleteHoliday = async (id: string) => {
    if (!confirm("정말 이 휴무일을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('holidays').delete().eq('id', id);
    if (!error) {
      setHolidays(holidays.filter(h => h.id !== id));
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold text-slate-400">명단을 불러오는 중...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto bg-slate-50 min-h-screen pb-32">
      <header className="mb-12 pt-8">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-2 uppercase tracking-widest">
          <Calendar size={16} />
          <span>Holidays & Closures</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">공휴일 및 휴무 관리</h1>
      </header>
      
      <section className="glass-card p-8 rounded-[40px] mb-12 bg-white shadow-xl shadow-slate-200/50 border border-white">
        <h2 className="text-xl font-black mb-8 flex items-center">
          <span className="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
          새 휴무일 추가
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="date" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
            <input 
              type="text" 
              placeholder="휴무일 명칭 (예: 설날, 개인 휴무)" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-[2] bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
          </div>
          <button 
            onClick={addHoliday}
            disabled={!newDate || !newLabel}
            className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-30"
          >
            <Plus size={20} />
            <span>휴무일 등록하기</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {holidays.map((h) => (
          <div key={h.id} className={`p-6 rounded-[32px] border transition-all ${h.is_active ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${h.is_active ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight">{h.label}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{h.holiday_date}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => toggleHoliday(h.id, h.is_active)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${h.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${h.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <button 
                  onClick={() => deleteHoliday(h.id)}
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {holidays.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold">등록된 휴무일이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
