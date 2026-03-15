"use client";

import { useState } from "react";

type Event = {
  id: number;
  type: "recurring" | "single";
  title: string;
  dayOfWeek?: number;
  date?: string;
  start: string;
  end: string;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function AdminEventSettings() {
  const [events, setEvents] = useState<Event[]>([
    { id: 1, type: "recurring", title: "주간 업무 회의", dayOfWeek: 2, start: "14:00", end: "15:00" },
    { id: 2, type: "single", title: "외부 파트너 미팅", date: "2024-03-25", start: "15:00", end: "17:00" },
  ]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen pb-24">
      <h1 className="text-2xl font-black mb-8 text-slate-800">일정 및 회의 관리</h1>

      {/* 정기 반복 일정 */}
      <section className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
          정기 반복 일정 (매주)
        </h2>
        <div className="space-y-3">
          {events.filter(e => e.type === "recurring").map(e => (
            <div key={e.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div>
                <p className="font-bold text-indigo-900">{e.title}</p>
                <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">
                  매주 {DAYS[e.dayOfWeek!]}요일 | {e.start} - {e.end}
                </p>
              </div>
              <button className="text-indigo-300 hover:text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-400 font-bold text-sm">+ 정기 회의 추가</button>
        </div>
      </section>

      {/* 일회성 특별 일정 */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-amber-400 rounded-full mr-2"></span>
          내 캘린더 (개별 일정)
        </h2>
        <div className="space-y-3">
          {events.filter(e => e.type === "single").map(e => (
            <div key={e.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div>
                <p className="font-bold text-amber-900">{e.title}</p>
                <p className="text-xs text-amber-600 font-medium">
                  {e.date} | {e.start} - {e.end}
                </p>
              </div>
              <button className="text-amber-300 hover:text-amber-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
            <p className="text-sm font-bold text-slate-800">새 일정 등록</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
              <input type="text" placeholder="일정 명칭" className="bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
            </div>
            <div className="flex space-x-2">
              <input type="time" className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
              <input type="time" className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
              <button className="bg-slate-900 text-white px-6 rounded-xl font-bold text-sm shadow-lg shadow-slate-200">등록</button>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 left-6 right-6">
        <button className="w-full h-16 bg-slate-900 text-white rounded-3xl font-bold shadow-2xl active:scale-95 transition-all">
          저장 및 적용하기
        </button>
      </div>
    </div>
  );
}
