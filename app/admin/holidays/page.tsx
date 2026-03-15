"use client";

import { useState } from "react";

type Holiday = { id: string; date: string; label: string; isActive: boolean };

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: "1", date: "2024-12-25", label: "크리스마스", isActive: true },
    { id: "2", date: "2025-01-01", label: "신정", isActive: true },
  ]);

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
                <p className="text-xs text-slate-400 font-medium">{h.date}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setHolidays(holidays.map(item => item.id === h.id ? {...item, isActive: !item.isActive} : item))}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${h.isActive ? 'bg-red-400' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${h.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <button className="text-slate-300">×</button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-50">
          <p className="text-sm font-bold mb-4">새 휴무일 추가</p>
          <div className="flex space-x-2">
            <input type="date" className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none" />
            <input type="text" placeholder="명칭" className="flex-[2] bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none" />
            <button className="bg-slate-900 text-white px-6 rounded-xl font-bold text-sm">추가</button>
          </div>
        </div>
      </div>
    </div>
  );
}
