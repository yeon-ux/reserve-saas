"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, Calendar, Clock, CheckCircle2, Timer, XCircle, ArrowLeft, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ReservationLookupPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [partner, setPartner] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function fetchPartner() {
      const { data } = await supabase
        .from('partners')
        .select('*')
        .eq('slug', slug)
        .single();
      setPartner(data);
    }
    fetchPartner();
  }, [slug]);

  const handleSearch = async () => {
    if (phone.length < 10) return;
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('partner_id', partner.id)
        .eq('customer_phone', phone.replace(/[^0-9]/g, ""))
        .order('reserved_at', { ascending: false });
      
      if (error) throw error;
      setReservations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!partner) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 pb-20">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
            <Link href={`/${slug}`} className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-black text-slate-900">예약 내역 확인</h1>
            <div className="w-14"></div>
        </div>

        {/* Search Box */}
        <section className="glass-card p-10 rounded-[48px] shadow-2xl bg-white border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Search size={120} />
           </div>
           
           <div className="relative z-10">
              <h2 className="text-2xl font-black text-slate-900 mb-2">내 예약 찾기</h2>
              <p className="text-slate-400 font-bold text-sm mb-10">예약 시 입력하신 휴대폰 번호를 입력해주세요.</p>
              
              <div className="space-y-4">
                 <div className="relative">
                    <input 
                       type="tel" 
                       placeholder="01012345678" 
                       value={phone}
                       onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                       className="w-full h-20 bg-slate-50 border-none rounded-[32px] px-8 text-2xl font-black text-slate-800 placeholder:text-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                    <button 
                       disabled={phone.length < 10 || isLoading}
                       onClick={handleSearch}
                       className="absolute right-3 top-3 h-14 px-8 bg-slate-900 text-white rounded-[24px] font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-20"
                    >
                       {isLoading ? "조회 중..." : "확인"}
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* Results */}
        <div className="space-y-4">
           {hasSearched && reservations.length > 0 ? (
              reservations.map((res) => (
                 <div key={res.id} className="glass-card p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-2xl text-[11px] font-black tracking-widest uppercase ${
                             res.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                             res.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                             res.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                             'bg-slate-100 text-slate-600'
                          }`}>
                             {res.status === 'confirmed' ? '확정됨' : 
                              res.status === 'pending' ? '승인 대기' : 
                              res.status === 'cancelled' ? '취소됨' : '방문 완료'}
                          </div>
                          {res.selected_service && (
                             <div className="px-4 py-2 bg-indigo-50 text-indigo-500 rounded-2xl text-[11px] font-black uppercase">
                                {res.selected_service}
                             </div>
                          )}
                       </div>
                       <div className="text-slate-300">
                          {res.status === 'confirmed' ? <CheckCircle2 size={24} /> : 
                           res.status === 'pending' ? <Timer size={24} /> : <XCircle size={24} />}
                       </div>
                    </div>

                    <div className="grid gap-4">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                             <Calendar size={20} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Date</p>
                             <p className="text-lg font-black text-slate-800">
                                {format(new Date(res.reserved_at), "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                             <Clock size={20} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Time</p>
                             <p className="text-lg font-black text-slate-800">
                                {format(new Date(res.reserved_at), "HH:mm")}
                             </p>
                          </div>
                       </div>
                       
                       {res.customer_memo && (
                          <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-2 flex items-center gap-2">
                                <MessageSquare size={12} /> Request Memo
                             </p>
                             <p className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {res.customer_memo}
                             </p>
                          </div>
                       )}
                    </div>
                 </div>
              ))
           ) : hasSearched && !isLoading ? (
              <div className="text-center py-20 glass-card rounded-[48px] bg-white border border-slate-100">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar size={32} className="text-slate-200" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900">예약 내역이 없습니다.</h3>
                 <p className="text-slate-400 text-sm font-bold mt-2">입력하신 정보로 등록된 활성 예약이 없습니다.</p>
              </div>
           ) : null}
        </div>

        {/* Footer info */}
        <div className="text-center">
            <p className="text-xs text-slate-300 font-bold">
                예약 변경이나 취소는 업체로 직접 문의해주세요.<br/>
                <span className="text-slate-900">{partner.business_name}</span> | {partner.phone || "연락처 정보 없음"}
            </p>
        </div>
      </div>
    </div>
  );
}
