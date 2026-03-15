"use client";

import AdSenseBanner from "./Phase8_애드센스_컴포넌트";

/**
 * 파트너 등급에 따라 광고를 제어하는 컨테이너
 */
export function AdContainer({ partner }: { partner: any }) {
  // 파트너가 유료 구독(is_pro: true)인 경우 광고를 표시하지 않음
  if (partner.is_pro) {
    return null;
  }

  return (
    <>
      {/* 하단 배포형 광고 */}
      <AdSenseBanner 
        client="ca-pub-xxxxxxxxxxxxxxxx" // 본인의 애드센스 ID로 변경
        slot="xxxxxxxxx" // 본인의 광고 슬롯 ID로 변경
      />
    </>
  );
}

/**
 * 사용 예시 (예약 완료 페이지 등)
 * 
 * return (
 *   <div>
 *     <ReservationSuccessContent />
 *     <AdContainer partner={partnerData} />
 *   </div>
 * )
 */
