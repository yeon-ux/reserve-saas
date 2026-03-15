"use client";

import { useState } from "react";

type Event = { id: string; title: string; type: 'recurring' | 'single'; time: string; dayOrDate: string };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([
    { id: "1", title: "주간 정기 회의", type: "recurring", time: "14:00 - 15:00", dayOrDate: "매주 월요일" },
    { id: "2", title: "내부 세미나", type: "single", time: "10:00 - 12:00", dayOrDate: "2024-11-20" },
  ]);

  return (
    <div className="p-8 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-900">회의 및 일정 관리</h1>
      
      <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold flex items-center">
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full mr-2"></span>
            고정/임시 일정 차단
          </h2>
          <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-full">+ 일정 추가</button>
        </div>

        <div className="space-y-4">
          {events.map((e) => (
            <div key={e.id} className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 hover:border-indigo-200 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${e.type === 'recurring' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  {e.type === 'recurring' ? '반복' : '단일'}
                </span>
                <button className="text-slate-300 group-hover:text-red-400 transition-colors">×</button>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">{e.title}</h3>
              <div className="flex items-center text-sm text-slate-500 font-medium">
                <span>{e.dayOrDate}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span>{e.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-600 rounded-[32px] text-white flex items-center justify-between shadow-xl shadow-indigo-100">
        <div>
          <p className="font-bold">스케줄 지능형 필터링</p>
          <p className="text-indigo-100 text-xs mt-1">등록된 모든 일정은 예약 시간표에서 자동 제외됩니다.</p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          ✨
        </div>
      </div>
    </div>
  );
}
