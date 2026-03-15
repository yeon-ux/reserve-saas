"use client";

import { useState } from "react";

type DayConfig = {
  day: number;
  label: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
};

const DAYS = [
  { day: 0, label: "일" },
  { day: 1, label: "월" },
  { day: 2, label: "화" },
  { day: 3, label: "수" },
  { day: 4, label: "목" },
  { day: 5, label: "금" },
  { day: 6, label: "토" },
];

export default function AdminScheduleSettings() {
  const [configs, setConfigs] = useState<DayConfig[]>(
    DAYS.map((d) => ({
      ...d,
      isActive: ![0, 1, 6].includes(d.day), // 기본값: 토, 일, 월 휴무 설정
      startTime: "10:00",
      endTime: "22:00",
    }))
  );

  const [breaks, setBreaks] = useState([
    { id: 1, label: "점심시간", start: "12:00", end: "13:00" },
    { id: 2, label: "저녁시간", start: "18:00", end: "19:00" },
  ]);

  const toggleDay = (day: number) => {
    setConfigs(configs.map(c => c.day === day ? { ...c, isActive: !c.isActive } : c));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-black mb-8 text-slate-800">운영 정책 설정</h1>

      {/* 요일 및 시간 설정 */}
      <section className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
          근무 요일 및 시간
        </h2>
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.day} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleDay(config.day)}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${
                    config.isActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {config.label}
                </button>
                <span className={`font-semibold ${config.isActive ? "text-slate-700" : "text-slate-300"}`}>
                  {config.isActive ? "근무 중" : "정기 휴무"}
                </span>
              </div>
              
              {config.isActive && (
                <div className="flex items-center space-x-2">
                  <input type="time" defaultValue={config.startTime} className="bg-slate-100 border-none rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <span className="text-slate-400">~</span>
                  <input type="time" defaultValue={config.endTime} className="bg-slate-100 border-none rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 휴식 시간 설정 */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
          고정 휴식 시간 (일괄 적용)
        </h2>
        <div className="space-y-4">
          {breaks.map((b) => (
            <div key={b.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
              <div>
                <p className="font-bold text-slate-700">{b.label}</p>
                <p className="text-xs text-slate-400 tracking-wider font-medium uppercase">Fixed Break Time</p>
              </div>
              <div className="flex items-center space-x-2">
                <input type="time" defaultValue={b.start} className="bg-white border-none rounded-lg p-2 text-sm font-medium shadow-sm outline-none" />
                <span className="text-slate-400">-</span>
                <input type="time" defaultValue={b.end} className="bg-white border-none rounded-lg p-2 text-sm font-medium shadow-sm outline-none" />
              </div>
            </div>
          ))}
          <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-400 transition-all">
            + 휴식 시간 추가
          </button>
        </div>
      </section>

      <div className="mt-10">
        <button className="w-full h-16 bg-slate-900 text-white rounded-3xl font-bold text-lg shadow-xl shadow-slate-200 active:scale-95 transition-all">
          설정 저장하기
        </button>
      </div>
    </div>
  );
}
