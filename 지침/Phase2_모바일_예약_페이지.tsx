"use client";

import { useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";

// 샘플 데이터 (실제로는 DB에서 가져옴)
const PARTNER_DATA = {
  name: "한동 상담소",
  bio: "마음의 휴식이 필요한 당신을 위한 공간입니다. 편안한 대화를 통해 에너지를 충전하세요.",
  profile_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky",
  is_pro: false,
};

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function MobileReservationPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 오늘부터 7일간의 날짜 생성
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* 상단 프로필 영역 */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 overflow-hidden ring-4 ring-indigo-50">
            <img src={PARTNER_DATA.profile_img} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{PARTNER_DATA.name}</h1>
            <p className="text-sm text-indigo-600 font-medium">전문 상담사</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">{PARTNER_DATA.bio}</p>
      </div>

      {/* 날짜 선택 (가로 스크롤) */}
      <div className="mt-8 px-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
          날짜 선택
        </h2>
        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
          {dates.map((date) => {
            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isSelected 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                    : "bg-white text-slate-400 border border-slate-100"
                }`}
              >
                <span className="text-[10px] uppercase font-bold mb-1">
                  {format(date, "eee", { locale: ko })}
                </span>
                <span className="text-lg font-black">{format(date, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 시간 선택 (그리드) */}
      <div className="mt-6 px-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
          시간 선택
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {TIME_SLOTS.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-200"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* 광고 영역 (샘플) */}
      {!PARTNER_DATA.is_pro && (
        <div className="mt-10 px-6">
          <div className="w-full h-24 bg-slate-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">AD SPACE (Google AdSense)</span>
          </div>
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={() => selectedTime && setShowForm(true)}
          disabled={!selectedTime}
          className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
        >
          {selectedTime ? `${format(selectedDate, "M월 d일")} ${selectedTime} 예약하기` : "시간을 선택해 주세요"}
        </button>
      </div>

      {/* 간단한 예약 모달 (추후 폼 세분화) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-300 focus:outline-none">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-2xl font-black mb-2 text-slate-800">예약 신청</h3>
            <p className="text-slate-500 mb-6 font-medium">{format(selectedDate, "M월 d일 (eee)", { locale: ko })} {selectedTime}</p>
            
            <div className="space-y-4 mb-8">
              <input type="text" placeholder="성함" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
              <input type="tel" placeholder="연락처" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setShowForm(false)} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold">취소</button>
              <button className="flex-[2] h-14 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">신청 완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
