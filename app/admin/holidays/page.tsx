"use client";

import { useState } from "react";

type Holiday = { id: string; date: string; label: string; isActive: boolean };

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Holiday = { id: string; holiday_date: string; label: string; is_active: boolean };

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHolidays() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('holidays')
        .select('*')
        .eq('partner_id', user.id)
        .order('holiday_date', { ascending: true });
      
      if (data) setHolidays(data);
      setIsLoading(false);
    }
    fetchHolidays();
  }, []);

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
    const { error } = await supabase.from('holidays').delete().eq('id', id);
    if (!error) {
      setHolidays(holidays.filter(h => h.id !== id));
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold">로딩 중...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-900">공휴일 및 휴무 관리</h1>
      
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-red-400 rounded-full mr-2"></span>
          휴무일 리스트
        </h2>
        
        <div className="space-y-3 mb-8">
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold text-slate-700">{h.label}</p>
                <p className="text-xs text-slate-400 font-medium">{h.holiday_date}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => toggleHoliday(h.id, h.is_active)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${h.is_active ? 'bg-red-400' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${h.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <button 
                  onClick={() => deleteHoliday(h.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {holidays.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">등록된 휴무일이 없습니다.</p>}
        </div>

        <div className="pt-6 border-t border-slate-50">
          <p className="text-sm font-bold mb-4">새 휴무일 추가</p>
          <div className="flex space-x-2">
            <input 
              type="date" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none" 
            />
            <input 
              type="text" 
              placeholder="명칭" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-[2] bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none" 
            />
            <button 
              onClick={addHoliday}
              className="bg-slate-900 text-white px-6 rounded-xl font-bold text-sm active:scale-95 transition-all"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
