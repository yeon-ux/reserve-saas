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

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 font-bold text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
              className="flex items-center justify-center space-x-2 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600"
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
              className="flex items-center justify-center space-x-2 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600"
            >
              <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
          
          <p className="text-center text-sm text-slate-400 mt-6">
            계정이 없으신가요? <Link href="/signup" className="text-indigo-600 font-bold hover:underline">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
