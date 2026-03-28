"use client";
import AdSenseBanner from "./AdSenseBanner";

export default function AdContainer({ partner }: { partner: any }) {
  // 파트너가 유료 구독(is_pro: true)인 경우 광고를 표시하지 않음
  if (partner?.is_pro) {
    return null;
  }

  return (
    <AdSenseBanner 
      client="ca-pub-xxxxxxxxxxxxxxxx" // 본인의 애드센스 ID로 변경
      slot="xxxxxxxxx" // 본인의 광고 슬롯 ID로 변경
    />
  );
}
