"use client";

import { useState } from "react";
import { format } from "date-fns";

type Holiday = {
  id: number;
  date: string;
  label: string;
  isActive: boolean;
};

export default function AdminHolidaySettings() {
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: 1, date: "2024-12-25", label: "크리스마스", isActive: true },
    { id: 2, date: "2025-01-01", label: "신정", isActive: true },
  ]);

  const toggleHoliday = (id: number) => {
    setHolidays(holidays.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h));
  };

  const removeHoliday = (id: number) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-black mb-8 text-slate-800">공휴일 및 특별 휴무 관리</h1>

      <section className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-red-400 rounded-full mr-2"></span>
          휴무일 리스트
        </h2>
        
        <div className="space-y-3">
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl transition-all">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">{h.label}</span>
                <span className="text-xs text-slate-400 font-medium">{h.date}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className={`text-xs mr-2 font-bold ${h.isActive ? "text-red-500" : "text-slate-400"}`}>
                    {h.isActive ? "휴무 적용" : "정상 근무"}
                  </span>
                  <button
                    onClick={() => toggleHoliday(h.id)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${h.isActive ? "bg-red-400" : "bg-slate-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${h.isActive ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
                <button onClick={() => removeHoliday(h.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {holidays.length === 0 && (
            <p className="text-center py-10 text-slate-400 text-sm font-medium">등록된 공휴일이 없습니다.</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-800 mb-4">새 휴무일 추가</p>
          <div className="flex space-x-2">
            <input type="date" className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none" />
            <input type="text" placeholder="명칭 (예: 설날)" className="flex-[2] bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none" />
            <button className="bg-slate-900 text-white px-4 rounded-xl font-bold text-sm">추가</button>
          </div>
        </div>
      </section>

      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 italic">
        <p className="text-xs text-blue-600 leading-relaxed font-medium">
          💡 법정 공휴일뿐만 아니라, 개인적인 사정으로 쉬고 싶은 날짜를 직접 등록하여 예약을 차단할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
