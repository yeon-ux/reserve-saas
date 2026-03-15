"use client";

import { useEffect, useState } from "react";

export default function AdSenseBanner({ 
  client, 
  slot 
}: { 
  client: string, 
  slot: string 
}) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {}
  }, []);

  return (
    <div className="ad-container my-4 text-center overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
