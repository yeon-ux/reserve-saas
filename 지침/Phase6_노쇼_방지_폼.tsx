"use client";

import { useState } from "react";

export default function BookingFormWithAntiNoShow({ 
  onConfirm, 
  isBlacklisted 
}: { 
  onConfirm: (data: any) => void,
  isBlacklisted: boolean 
}) {
  const [agreed, setAgreed] = useState(false);
  const [phone, setPhone] = useState("");

  if (isBlacklisted) {
    return (
      <div className="p-8 bg-red-50 rounded-[32px] border border-red-100 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-red-900 mb-2">예약 불가 안내</h3>
        <p className="text-red-600 text-sm leading-relaxed">
          과거 반복적인 노쇼(No-Show) 이력이 확인되어<br/>시스템상 예약이 제한되었습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="성함" 
          className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
        />
        <input 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="연락처 (숫자만 입력)" 
          className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
        />
      </div>

      {/* 노쇼 방지 약관 동의 */}
      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-50">
        <div className="flex items-start space-x-3">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 leading-snug cursor-pointer font-medium">
            <span className="text-indigo-700 font-bold">[필수]</span> 예약 부도(노쇼) 방지 정책에 동의합니다. 
            변경 사항은 최소 24시간 전 연락 주셔야 하며, 무단 불참 시 향후 서비스 이용이 영구 제한될 수 있습니다.
          </label>
        </div>
      </div>

      <button
        disabled={!agreed || !phone}
        onClick={() => onConfirm({ phone })}
        className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
      >
        예약 확정하기
      </button>
    </div>
  );
}
