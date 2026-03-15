"use client";

import { useEffect } from "react";

/**
 * 구글 애드센스 광고 단위 컴포넌트
 */
export default function AdSenseBanner({ 
  client, 
  slot, 
  format = "auto", 
  responsive = "true" 
}: { 
  client: string, 
  slot: string, 
  format?: string, 
  responsive?: string 
}) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  return (
    <div className="my-10 px-4 overflow-hidden text-center">
      <p className="text-[10px] text-slate-300 uppercase tracking-widest mb-2">Advertisement</p>
      {/* 구글 애드센스 코드 (레이아웃 고정 높이 확보 권장) */}
      <div className="min-h-[100px] bg-slate-50 flex items-center justify-center rounded-2xl overflow-hidden border border-slate-100">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </div>
  );
}
