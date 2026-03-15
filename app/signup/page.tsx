"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200">
        <h1 className="text-3xl font-black mb-2">시작하기</h1>
        <p className="text-slate-400 mb-8 font-medium">예약 페이지의 주소가 될 별칭을 입력하세요.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reservation URL</label>
            <div className="flex items-center bg-slate-50 rounded-2xl p-4 mt-1 border border-slate-100">
              <span className="text-slate-400 font-bold mr-1">reserve.smarthow.net/</span>
              <input type="text" placeholder="kim" className="bg-transparent border-none outline-none font-bold text-slate-900 flex-1" />
            </div>
          </div>
          
          <input type="email" placeholder="이메일 주소" className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
          <input type="password" placeholder="비밀번호" className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
          
          <button className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg mt-4 shadow-xl active:scale-95 transition-all">
            회원가입 완료
          </button>
        </div>
      </div>
    </div>
  );
}
