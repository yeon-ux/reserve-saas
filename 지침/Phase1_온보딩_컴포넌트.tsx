"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { debounce } from "lodash";

export default function OnboardingSlug() {
  const [slug, setSlug] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  // 슬러그 실시간 입력을 처리하고 중복 확인
  const checkSlugAvailability = debounce(async (value: string) => {
    if (value.length < 2) {
      setIsAvailable(null);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("partners")
      .select("slug")
      .eq("slug", value)
      .single();

    // 데이터가 없으면(error가 있거나 null이면) 사용 가능한 슬러그
    if (error && error.code === "PGRST116") {
      setIsAvailable(true);
    } else {
      setIsAvailable(false);
    }
    setLoading(false);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(value);
    checkSlugAvailability(value);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-4 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800">예약 주소 설정</h2>
      <p className="text-gray-500 text-sm">
        고객들이 접속할 고유 주소를 입력해 주세요. (예: reserve.smarthow.net/<b>your-id</b>)
      </p>

      <div className="relative">
        <input
          type="text"
          value={slug}
          onChange={handleChange}
          placeholder="사용자 고유 ID (예: kim-salon)"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            isAvailable === true
              ? "border-green-500 focus:ring-green-200"
              : isAvailable === false
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-200 focus:ring-blue-200"
          }`}
        />
        {loading && (
          <div className="absolute right-3 top-3 text-blue-500 animate-spin">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      <div className="h-6">
        {isAvailable === true && (
          <p className="text-green-600 text-sm font-medium">✨ 사용 가능한 주소입니다!</p>
        )}
        {isAvailable === false && (
          <p className="text-red-600 text-sm font-medium">❌ 이미 사용 중인 주소입니다.</p>
        )}
      </div>

      <button
        disabled={!isAvailable || loading}
        className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        예약 페이지 만들기
      </button>
    </div>
  );
}
