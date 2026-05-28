'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Utensils, ArrowLeft } from 'lucide-react';
import { GlassButton } from '@/components/ui/Glass';
import { useRestaurant } from '@/context/RestaurantContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedTable } = useRestaurant();
  const isHome = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 px-4 h-14 md:h-20 flex items-center justify-between backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
      <div className="flex items-center gap-2 md:gap-3">
        {/* ปุ่มย้อนกลับ: แสดงเฉพาะมือถือ และไม่ใช่หน้า Home */}
        {!isHome && (
          <button
            onClick={() => router.back()}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 text-white active:scale-90 active:bg-white/25 transition-all border border-white/10"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group">
          <div className="bg-gradient-to-br from-orange-400 to-pink-600 text-white p-2 md:p-2.5 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Utensils size={18} className="md:hidden" />
            <Utensils size={22} className="hidden md:block" />
          </div>
          <span className="font-bold text-lg md:text-xl text-white tracking-tight drop-shadow-sm">อิ่มขนาด</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
         {/* ปุ่มหน้าหลัก: ซ่อนบนมือถือ (ใช้ปุ่มย้อนแทน) */}
         {!isHome && (
           <Link href="/" className="hidden md:block">
             <GlassButton className="!text-white !bg-white/20 !border-white/30 text-sm px-4 py-2 hover:!bg-white/30">
               หน้าหลัก
             </GlassButton>
           </Link>
         )}
         
         {/* แสดงชื่อโต๊ะเมื่ออยู่ในหน้าสั่งอาหาร */}
         {pathname === '/ordering' && selectedTable && (
           <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold border border-white/10">
             {selectedTable.name}
           </div>
         )}
      </div>
    </nav>
  );
}