"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Sparkles, Globe, User, Lock, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function SignupPage() {
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (slug.length < 2) {
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
  }, [slug]);

  const handleSignup = async () => {
    if (!isAvailable || !email || !password) return;
    setLoading(true);
    setErrorMsg("");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("partners").insert([
        {
          id: authData.user.id,
          slug: slug.toLowerCase(),
          name: slug,
          is_pro: false
        },
      ]);

      if (profileError) {
        setErrorMsg(`프로필 생성 오류: ${profileError.message}`);
        setLoading(false);
      } else {
        router.push("/admin/schedule");
      }
    }
  };

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

          <p className="text-center text-slate-400 font-bold text-sm mt-4">
            이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 hover:underline">로그인 페이지로</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
