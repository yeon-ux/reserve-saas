"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  client?: string;
  slot: string;
  format?: string;
  responsive?: boolean;
}

export default function AdBanner({ 
  client = "ca-pub-xxxxxxxxxxxxxxxx", // TODO: 실제 애드센스 퍼블리셔 ID로 교체하세요
  slot, 
  format = "auto", 
  responsive = true 
}: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="w-full my-12 flex justify-center overflow-hidden min-h-[100px] bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 items-center relative group">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: "300px" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      
      {/* 개발 중 안내 (ID가 xxxxxxxx인 경우에만 표시) */}
      {client.includes("xxxx") && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px]">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest text-center px-6">
            준비 중인 광고 공간<br/>
            <span className="text-[10px] lowercase font-bold text-slate-300">Ads will appear here once the ID is set</span>
          </p>
        </div>
      )}
    </div>
  );
}
