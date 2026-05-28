'use client';
import Link from 'next/link';
import { Utensils, Calendar, QrCode, ChefHat, Sparkles } from 'lucide-react';
import { GlassButton } from '@/components/ui/Glass';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in relative z-10">
      
      {/* === MOBILE LAYOUT === */}
      <div className="md:hidden w-full max-w-md mx-auto flex flex-col min-h-[calc(100vh-80px)]">
        {/* Mobile Header / Greeting */}
        <div className="pt-6 pb-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-white/80 text-sm font-medium">ยินดีต้อนรับ</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
            อิ่มขนาด
          </h1>
          <p className="text-white/70 text-sm mt-1">เลือกบริการที่ต้องการ</p>
        </div>

        {/* Mobile Action Cards */}
        <div className="flex-1 flex flex-col gap-4 mt-4">
          <Link href="/reservation" className="w-full group">
            <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl p-6 shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center gap-5">
              <div className="bg-gradient-to-br from-pink-100 to-pink-50 p-4 rounded-2xl text-pink-600 shadow-inner shrink-0">
                <Calendar size={32} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-slate-800">จองโต๊ะล่วงหน้า</h3>
                <p className="text-slate-500 text-xs mt-0.5">เลือกวันเวลาที่สะดวก</p>
              </div>
              <div className="text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
          
          <Link href="/scan" className="w-full group">
            <div className="bg-gradient-to-r from-orange-500/80 to-pink-500/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-5">
              <div className="bg-white/20 p-4 rounded-2xl text-white shadow-inner shrink-0">
                <QrCode size={32} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-white">สแกนสั่งอาหาร</h3>
                <p className="text-white/70 text-xs mt-0.5">สแกน QR Code ที่โต๊ะ</p>
              </div>
              <div className="text-white/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile Kitchen Link */}
        <div className="mt-auto pt-6 pb-4">
          <Link href="/kitchen">
            <button className="w-full text-white/60 hover:text-white flex items-center justify-center gap-2 text-sm bg-black/15 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-black/25 transition-all cursor-pointer active:scale-95">
              <ChefHat size={16} />
              <span>สำหรับพนักงานครัว</span>
            </button>
          </Link>
        </div>
      </div>

      {/* === DESKTOP LAYOUT (original) === */}
      <div className="hidden md:flex flex-col items-center justify-center">
        {/* Logo Section */}
        <div className="bg-white/30 p-8 rounded-full backdrop-blur-md shadow-2xl border border-white/40 mb-6 animate-bounce-slow">
          <Utensils size={80} className="text-white drop-shadow-md" />
        </div>
        
        {/* Title Section */}
        <div className="space-y-2 mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight">อิ่มขนาด</h1>
          <p className="text-white/90 text-lg md:text-xl font-light tracking-wide">Reservation System</p>
        </div>
        
        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
          <Link href="/reservation" className="w-full group">
              <GlassButton className="flex flex-col items-center justify-center gap-4 p-8 text-xl h-48 w-full group-hover:bg-white/40 transition-all duration-300">
                  <div className="bg-pink-100 p-4 rounded-full text-pink-600 shadow-inner group-hover:scale-110 transition-transform">
                      <Calendar size={40} /> 
                  </div>
                  <span className="text-slate-800 font-bold">จองโต๊ะล่วงหน้า</span>
              </GlassButton>
          </Link>
          
          <Link href="/scan" className="w-full group">
              <GlassButton active className="flex flex-col items-center justify-center gap-4 p-8 text-xl h-48 w-full group-hover:shadow-orange-500/50 transition-all duration-300">
                  <div className="bg-white/20 p-4 rounded-full text-white shadow-inner group-hover:scale-110 transition-transform">
                      <QrCode size={40} /> 
                  </div>
                  <span className="text-white font-bold">สแกนสั่งอาหาร</span>
              </GlassButton>
          </Link>
        </div>
        
        {/* Kitchen Link */}
        <Link href="/kitchen" className="mt-16">
          <button className="text-white/70 hover:text-white flex items-center gap-2 text-sm bg-black/20 px-5 py-2.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-black/30 transition-all cursor-pointer">
              <ChefHat size={16} /> 
              <span>สำหรับพนักงานครัว</span>
          </button>
        </Link>
      </div>

    </div>
  );
}