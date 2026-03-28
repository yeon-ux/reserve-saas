"use client";
export const runtime = 'edge';
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Sparkles, Globe, User, Lock, ArrowRight, CheckCircle, X, Check, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkExistingUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setEmail(session.user.email || "");
        // 이미 파트너 등록이 되어있는지 확인
        const { data: partner } = await supabase
          .from('partners')
          .select('slug')
          .eq('id', session.user.id)
          .single();
        
        if (partner) {
          router.push("/admin/reservations");
        }
      }
    }
    if (mounted) checkExistingUser();
  }, [mounted, router]);

  useEffect(() => {
    if (!mounted || slug.length < 2) {
      setIsAvailable(null);
      return;
    }

    const checkSlug = async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("slug")
        .eq("slug", slug.toLowerCase())
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
          setErrorMsg("연결 오류: 서비스가 준비 중이거나 설정이 올바르지 않습니다.");
        }
      } else {
        setIsAvailable(false);
      }
    };

    const timer = setTimeout(checkSlug, 500);
    return () => clearTimeout(timer);
  }, [slug, mounted]);

  const handleSignup = async () => {
    if (!isAvailable || !email) return;
    setLoading(true);
    setErrorMsg("");

    const { data: { session } } = await supabase.auth.getSession();
    let userId = session?.user?.id;

    if (!session) {
      // 1. 이메일/비번 가입 (세션이 없을 때만)
      if (!password) {
        setErrorMsg("비밀번호를 입력해주세요.");
        setLoading(false);
        return;
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setErrorMsg(authError.message);
        setLoading(false);
        return;
      }
      userId = authData.user?.id;
    }

    if (userId) {
      // 2. 파트너 프로필 생성
      const { error: profileError } = await supabase.from("partners").insert([
        {
          id: userId,
          slug: slug.toLowerCase(),
          name: slug,
          is_pro: false
        },
      ]);

      if (profileError) {
        setErrorMsg(`프로필 생성 오류: ${profileError.message}`);
        setLoading(false);
      } else {
        if (router) {
          router.push("/admin/schedule");
        } else {
          window.location.href = "/admin/schedule";
        }
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-['Outfit']">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-100 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-violet-100 rounded-full blur-[100px]" />

      <div className="w-full max-w-xl glass-card p-12 rounded-[48px] relative z-10 shadow-2xl shadow-indigo-100">
        <header className="mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-bold text-xs mb-4">
            <Sparkles size={14} />
            <span>회원가입</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">나만의 예약 페이지 만들기</h1>
          <p className="text-slate-400 font-medium">단 1분 만에 자신만의 예약 링크를 생성하세요.</p>
        </header>

        <div className="space-y-6">
          <div className="group">
            <label className="text-sm font-bold text-slate-400 mb-2 block ml-1 flex items-center">
              <Globe size={14} className="mr-1.5 text-slate-300" />
              Reservation URL
            </label>
            <div className={`flex items-center bg-white border-2 rounded-2xl p-4 transition-all ${isAvailable === true ? 'border-green-200 bg-green-50/20' : isAvailable === false ? 'border-red-200 bg-red-50/20' : 'border-slate-100 focus-within:border-indigo-500'}`}>
              <span className="text-slate-400 font-bold mr-1">reserve.smarthow.net/</span>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                placeholder="별칭 입력" 
                className="bg-transparent border-none outline-none font-black text-slate-900 flex-1 placeholder:text-slate-200" 
              />
              {isAvailable === true && <CheckCircle2 className="text-green-500" size={20} />}
              {isAvailable === false && <XCircle className="text-red-500" size={20} />}
            </div>
            {isAvailable === true && <p className="text-xs text-green-600 font-bold mt-2 ml-1">멋진 주소네요! 사용 가능합니다.</p>}
            {isAvailable === false && <p className="text-xs text-red-600 font-bold mt-2 ml-1">이미 사용 중이거나 연결 오류가 발생했습니다.</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block ml-1 flex items-center">
                <User size={14} className="mr-1.5 text-slate-300" />
                이메일
              </label>
              <input 
                type="email" 
                placeholder="example@mail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-black text-slate-900 transition-all" 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block ml-1 flex items-center">
                <Lock size={14} className="mr-1.5 text-slate-300" />
                비밀번호
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-black text-slate-900 transition-all" 
              />
            </div>
          </div>
          
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 font-bold text-sm">
              <XCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button 
            onClick={handleSignup}
            disabled={!isAvailable || loading}
            className={`group w-full h-20 rounded-[28px] font-black text-xl mt-4 shadow-2xl transition-all flex items-center justify-center space-x-3 ${!isAvailable || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'premium-gradient text-white shadow-indigo-200 active:scale-95 hover:scale-[1.02]'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>계정 생성 및 시작하기</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 font-bold text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
              className="flex items-center justify-center space-x-2 py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin } })}
              className="flex items-center justify-center space-x-2 py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600"
            >
              <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <p className="text-center text-slate-400 font-bold text-sm mt-4">
            이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 hover:underline">로그인 페이지로</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
