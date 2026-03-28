"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Calendar, Clock, Bell, Settings, LogOut, Users, Home, ExternalLink, Copy, Check } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setOrigin(window.location.host);
    }
    
    // Auth 상태 변화 감지 및 초기 유저 정보 가져오기
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('partners')
          .select('slug')
          .eq('id', session.user.id)
          .single();
        if (data) setSlug(data.slug);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('partners')
          .select('slug')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setSlug(data.slug);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const copyLink = () => {
    if (typeof window === "undefined") return;
    const link = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { name: "예약 명단", href: "/admin/reservations", icon: Users },
    { name: "스케줄 설정", href: "/admin/schedule", icon: Clock },
    { name: "휴무일 관리", href: "/admin/holidays", icon: Calendar },
    { name: "일정 차단", href: "/admin/events", icon: Bell },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-['Outfit']">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-80 bg-white border-r border-slate-100 flex-col p-8 fixed h-full z-50">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">S</div>
          <span className="font-black text-xl tracking-tight text-slate-900 leading-none">Smart<br/>Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {mounted && navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center space-x-3 p-4 rounded-2xl font-black text-sm transition-all ${
                pathname === item.href 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
          {!mounted && <div className="p-4 text-slate-300 font-bold">메뉴 로딩 중...</div>}
        </nav>

        {/* Share Section */}
        {slug && (
          <div className="mb-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">내 예약 페이지 링크</p>
             <div className="bg-white p-3 rounded-2xl border border-slate-100 mb-4 overflow-hidden">
                <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{origin || 'reserve.smarthow.net'}/{slug}</p>
             </div>
             <div className="flex space-x-2">
                <button 
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-white transition-all active:scale-95"
                >
                   {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                   <span>{copied ? '복사됨' : '복사'}</span>
                </button>
                <Link 
                  href={`/${slug}`} 
                  target="_blank"
                  className="w-12 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                   <ExternalLink size={16} />
                </Link>
             </div>
          </div>
        )}

        <div className="pt-8 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-4 rounded-2xl font-black text-sm text-slate-400 hover:text-red-500 transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-80 min-h-screen relative">
        {/* Mobile Nav Header */}
        <header className="md:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">S</div>
            <span className="font-black text-slate-900 tracking-tight">Smart Admin</span>
          </div>
          <div className="flex items-center space-x-3">
             {slug && (
                <Link href={`/${slug}`} target="_blank" className="p-2 bg-slate-50 rounded-lg text-slate-400">
                   <ExternalLink size={20} />
                </Link>
             )}
             <button onClick={handleLogout} className="p-2 text-slate-400">
                <LogOut size={20} />
             </button>
          </div>
        </header>

        {/* Mobile Sub-Nav */}
        <div className="md:hidden flex overflow-x-auto p-4 space-x-2 no-scrollbar bg-white/50 backdrop-blur-md border-b border-slate-100 sticky top-[65px] z-10">
          {mounted && navItems.map((item) => (
             <Link 
                key={item.href} 
                href={item.href}
                className={`flex-none px-5 py-2.5 rounded-2xl font-black text-xs transition-all ${
                   pathname === item.href 
                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                   : "bg-white text-slate-400 border border-slate-100"
                }`}
             >
                {item.name}
             </Link>
          ))}
          {!mounted && <div className="p-2 text-slate-300 text-xs font-bold">로딩 중...</div>}
        </div>
        
        <div className="p-4 md:p-8 relative z-0">{children}</div>
      </main>
    </div>
  );
}
