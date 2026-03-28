"use client";
import { useEffect } from "react";

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
      <p className="text-[10px] text-slate-300 uppercase tracking-widest mb-2 font-black">Advertisement</p>
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
