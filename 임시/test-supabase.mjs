import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('오류: 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Supabase 연결 테스트 시작...')
  console.log(`URL: ${supabaseUrl}`)
  
  try {
    // 가장 기본적인 쿼리 실행 (헬스 체크 대용)
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1).maybeSingle()
    
    // 테이블이 없어도 연결 자체는 성공하면 200/404 등으로 응답이 오므로 에러 객체를 확인
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      console.error('연결 오류:', error.message)
      return false
    }
    
    console.log('✅ Supabase 연결 성공!')
    return true
  } catch (err) {
    console.error('예외 발생:', err)
    return false
  }
}

testConnection()
