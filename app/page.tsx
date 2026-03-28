"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import AdBanner from "../components/AdBanner";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isPartner, setIsPartner] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('partners')
          .select('slug')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setIsPartner(true);
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!mounted) return null;
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden relative font-['Outfit']">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/30 rounded-full blur-[120px] animate-pulse delay-700" />

      <nav className="relative z-10 px-8 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 animate-float">
             <span className="text-white text-2xl font-black">S</span>
          </div>
          <span className="text-2xl font-black tracking-tight drop-shadow-sm">Smart Reserve</span>
        </div>
        {session ? (
          <Link href="/admin/reservations" className="px-6 py-2.5 font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            관리자 대시보드
          </Link>
        ) : (
          <Link href="/login" className="px-6 py-2.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            로그인
          </Link>
        )}
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 font-bold text-sm">
            <Sparkles size={16} />
            <span>AI 기반 노코드 예약 솔루션</span>
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
            가장 쉬운<br/>
            <span className="text-transparent bg-clip-text premium-gradient">예약의 시작</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
            복잡한 대화 없이, 나만의 고유한 링크 하나로 고객의 예약을 관리하세요. 수익 창출을 위한 가장 스마트한 도구입니다.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
            <Link 
              href={session ? (isPartner ? "/admin/reservations" : "/signup") : "/signup"} 
              className="w-full sm:w-auto px-10 py-5 premium-gradient text-white rounded-[24px] font-black text-xl shadow-2xl shadow-indigo-200 flex items-center justify-center space-x-3 hover:scale-105 active:scale-95 transition-all"
            >
              <span>{session ? (isPartner ? "관리자 대시보드" : "회원가입 완료하기") : "무료로 시작하기"}</span>
              <ArrowRight size={20} />
            </Link>
            <div className="flex items-center -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                </div>
              ))}
              <span className="ml-6 text-sm font-bold text-slate-400">1,200+ 명의 파트너와 함께</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="glass-card p-4 rounded-[48px] rotate-3 translate-x-10 shadow-2xl relative z-10">
             <div className="bg-slate-50 rounded-[36px] p-6 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <div className="h-2 w-20 bg-slate-200 rounded-full" />
                      <div className="h-4 w-32 bg-slate-900 rounded-full font-bold" />
                   </div>
                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <CheckCircle2 size={24} />
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   {[1,2,3,4,5,6].map(i => (
                      <div key={i} className={`h-12 rounded-2xl ${i===2 ? 'premium-gradient' : 'bg-white border border-slate-100 shadow-sm'}`} />
                   ))}
                </div>
                <div className="h-14 w-full bg-slate-900 rounded-2xl" />
             </div>
          </div>
          <div className="absolute top-20 left-[-40px] glass-card p-6 rounded-[32px] -rotate-6 shadow-xl z-20 animate-float">
             <div className="flex items-center space-x-3">
                <Zap className="text-orange-400 fill-orange-400" />
                <span className="font-bold text-slate-700 text-lg">실시간 알림 완료</span>
             </div>
          </div>
          <div className="absolute bottom-10 right-0 glass-card p-6 rounded-[32px] rotate-12 shadow-xl z-0 scale-90 opacity-50">
             <Shield className="text-green-500 mb-2" />
             <div className="h-2 w-16 bg-slate-200 rounded-full" />
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-8 pb-12 text-center text-slate-400 text-sm font-medium">
        <div className="mb-8">
          <AdBanner slot="landing-footer" />
        </div>
        © 2026 Smart Reserve. All rights reserved.
      </footer>
    </div>
  )
}

function CheckCircle2({ size }: { size: number }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
   )
}
