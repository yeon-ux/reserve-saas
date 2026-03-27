"use client";
export const runtime = "edge";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/admin/schedule");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md glass-card p-10 rounded-[40px]">
        <h1 className="text-3xl font-black mb-2">반가워요!</h1>
        <p className="text-slate-400 mb-8 font-medium">관리자 계정으로 로그인하세요.</p>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="이메일 주소" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 bg-white/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all" 
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 bg-white/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all" 
          />
          
          {errorMsg && <p className="text-sm text-red-500 font-bold text-center">{errorMsg}</p>}

          <button 
            onClick={handleLogin}
            disabled={loading}
            className={`w-full h-16 rounded-2xl font-bold text-lg mt-4 shadow-xl active:scale-95 transition-all premium-gradient text-white ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          
          <p className="text-center text-sm text-slate-400 mt-6">
            계정이 없으신가요? <Link href="/signup" className="text-indigo-600 font-bold hover:underline">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
