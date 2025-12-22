'use client';
import Link from 'next/link';
import { Utensils, Calendar, QrCode, ChefHat } from 'lucide-react';
import { GlassButton } from '@/components/ui/Glass';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in relative z-10">
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
      
      {/* Footer / Version */}

    </div>
  );
}