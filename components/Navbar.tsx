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

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 px-4 h-14 md:h-16 flex items-center justify-between backdrop-blur-md bg-white/95 border-b border-stone-200/80 shadow-xs">
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* ปุ่มย้อนกลับ: แสดงบนทุกอุปกรณ์ */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-medium text-xs md:text-sm border border-stone-200/70 transition active:scale-95 cursor-pointer shadow-xs group"
          title="ย้อนกลับ"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="h-5 w-[1px] bg-stone-200" />

        <Link href="/" className="flex items-center gap-2 md:gap-2.5 cursor-pointer group">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-1.5 md:p-2 rounded-xl shadow-xs group-hover:rotate-12 transition-transform duration-300">
            <Utensils size={18} />
          </div>
          <span className="font-extrabold text-base md:text-lg text-stone-900 tracking-tight">อิ่มขนาด</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* แสดงชื่อโต๊ะเมื่ออยู่ในหน้าสั่งอาหาร */}
        {pathname === '/ordering' && selectedTable && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold border border-amber-200/80 shadow-xs">
            <span className="text-amber-700 font-normal">โต๊ะ:</span>
            <span className="font-bold text-amber-900">{selectedTable.name}</span>
          </div>
        )}
      </div>
    </nav>
  );
}