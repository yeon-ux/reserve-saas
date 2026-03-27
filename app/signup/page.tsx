"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // 슬러그 실시간 입력을 처리하고 중복 확인
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
      
      // PGRST116: Results not found (사용 가능)
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

    // 1. Supabase Auth 회원가입
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
      // 2. Partners 프로필 생성
      const { error: profileError } = await supabase.from("partners").insert([
        {
          id: authData.user.id,
          slug: slug.toLowerCase(),
          name: slug, // 초기 이름은 슬러그로 설정
          is_pro: false
        },
      ]);

      if (profileError) {
        setErrorMsg("프로필 생성 중 오류가 발생했습니다.");
        setLoading(false);
      } else {
        // 성공 시 어드민으로 이동
        router.push("/admin/schedule");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200">
        <h1 className="text-3xl font-black mb-2">시작하기</h1>
        <p className="text-slate-400 mb-8 font-medium">예약 페이지의 주소가 될 별칭을 입력하세요.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reservation URL</label>
            <div className={`flex items-center bg-slate-50 rounded-2xl p-4 mt-1 border ${isAvailable === true ? 'border-green-400' : isAvailable === false ? 'border-red-400' : 'border-slate-100'}`}>
              <span className="text-slate-400 font-bold mr-1">reserve.smarthow.net/</span>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                placeholder="kim" 
                className="bg-transparent border-none outline-none font-bold text-slate-900 flex-1" 
              />
            </div>
            {isAvailable === true && <p className="text-[10px] text-green-500 font-bold mt-1 ml-1">멋진 주소네요! 사용 가능합니다.</p>}
            {isAvailable === false && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">이미 사용 중인 주소입니다.</p>}
          </div>
          
          <input 
            type="email" 
            placeholder="이메일 주소" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
          />
          
          {errorMsg && <p className="text-sm text-red-500 font-bold text-center">{errorMsg}</p>}

          <button 
            onClick={handleSignup}
            disabled={!isAvailable || loading}
            className={`w-full h-16 rounded-2xl font-bold text-lg mt-4 shadow-xl active:scale-95 transition-all ${!isAvailable || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}
          >
            {loading ? "가입 중..." : "회원가입 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
