/**
 * 고객의 신뢰도를 확인하는 블랙리스트 체크 로직
 */

import { SupabaseClient } from '@supabase/supabase-js';

export async function checkIsBlacklisted(
  supabase: SupabaseClient,
  phone: string,
  threshold: number = 2 // 노쇼 허용 횟수
): Promise<boolean> {
  // 1. 해당 전화번호의 노쇼(no_show_at이 null이 아닌 것) 횟수 조회
  const { count, error } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('customer_phone', phone)
    .not('no_show_at', 'is', null);

  if (error) {
    console.error("Blacklist check error:", error);
    return false; // 에러 시 일단 통과 (수동 처리 권장)
  }

  // 2. 설정된 임계치(예: 2회 초과) 이상이면 블랙리스트로 판단
  return (count || 0) >= threshold;
}
