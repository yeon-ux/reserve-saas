"use client";

import { useState } from "react";

type Break = { id: string; start: string; end: string; label: string };

export default function AdminSchedulePage() {
  const [days, setDays] = useState([
    { name: "월", on: true, start: "10:00", end: "22:00" },
    { name: "화", on: true, start: "10:00", end: "22:00" },
    { name: "수", on: true, start: "10:00", end: "22:00" },
    { name: "목", on: true, start: "10:00", end: "22:00" },
    { name: "금", on: true, start: "10:00", end: "22:00" },
    { name: "토", on: false, start: "10:00", end: "22:00" },
    { name: "일", on: false, start: "10:00", end: "22:00" },
  ]);

  const [breaks, setBreaks] = useState<Break[]>([
    { id: "1", start: "12:00", end: "13:00", label: "점심시간" },
  ]);

  return (
    <div className="p-8 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-900">운영 시간 및 휴게 설정</h1>
      
      {/* 요일별 설정 */}
      <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
          영업 요일 및 시간
        </h2>
        <div className="space-y-4">
          {days.map((day, idx) => (
            <div key={day.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    const newDays = [...days];
                    newDays[idx].on = !newDays[idx].on;
                    setDays(newDays);
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${day.on ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${day.on ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className="font-bold text-slate-700 w-4">{day.name}</span>
              </div>
              
              {day.on && (
                <div className="flex items-center space-x-2">
                  <input type="time" value={day.start} className="bg-white border-none rounded-xl p-2 text-sm font-bold shadow-sm" />
                  <span className="text-slate-300">-</span>
                  <input type="time" value={day.end} className="bg-white border-none rounded-xl p-2 text-sm font-bold shadow-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 고정 휴게 시간 */}
      <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold flex items-center">
            <span className="w-1.5 h-6 bg-orange-400 rounded-full mr-2"></span>
            정기 휴게 시간 (브레이크)
          </h2>
          <button className="text-indigo-600 text-sm font-bold">+ 추가</button>
        </div>
        <div className="space-y-3">
          {breaks.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <span className="font-bold text-orange-900">{b.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-orange-700">{b.start} - {b.end}</span>
                <button className="text-orange-300 ml-2">×</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="w-full h-16 bg-slate-900 text-white rounded-3xl font-bold mt-8 shadow-xl shadow-slate-200 active:scale-95 transition-all">
        설정 저장하기
      </button>
    </div>
  );
}
