import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-20 h-20 bg-indigo-600 rounded-[28px] rotate-12 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200">
        <span className="text-white text-3xl font-black -rotate-12">S</span>
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Smart Reserve</h1>
      <p className="text-slate-500 text-center mb-12 max-w-xs leading-relaxed">
        나만의 고유한 예약 링크를 생성하고<br/>고객과 공유하여 수익을 창출하세요.
      </p>
      
      <div className="w-full max-w-sm space-y-4">
        <Link href="/signup" className="block w-full py-5 bg-slate-900 text-white text-center rounded-[24px] font-bold text-lg shadow-xl active:scale-95 transition-all">
          무료로 시작하기
        </Link>
        <p className="text-center text-sm text-slate-400">
          이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 font-bold underline underline-offset-4">로그인</Link>
        </p>
      </div>
    </div>
  )
}
