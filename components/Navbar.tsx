'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils } from 'lucide-react';
import { GlassButton } from '@/components/ui/Glass';
import { useRestaurant } from '@/context/RestaurantContext';

export default function Navbar() {
  const pathname = usePathname();
  const { selectedTable } = useRestaurant();

  return (
    <nav className="sticky top-0 z-50 px-4 h-20 flex items-center justify-between backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
      <Link href="/" className="flex items-center gap-3 cursor-pointer group">
        <div className="bg-gradient-to-br from-orange-400 to-pink-600 text-white p-2.5 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
          <Utensils size={22} />
        </div>
        <span className="font-bold text-xl text-white tracking-tight drop-shadow-sm">อิ่มขนาด</span>
      </Link>
      
      <div className="flex items-center gap-3">
         {pathname !== '/' && (
           <Link href="/">
             <GlassButton className="!text-white !bg-white/20 !border-white/30 text-sm px-4 py-2 hover:!bg-white/30">
               หน้าหลัก
             </GlassButton>
           </Link>
         )}
         
         {/* แสดงชื่อโต๊ะเฉพาะเมื่ออยู่ในหน้าสั่งอาหารและเลือกโต๊ะแล้ว */}
         {pathname === '/ordering' && selectedTable && (
           <div className="hidden md:flex items-center gap-2 bg-black/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold border border-white/10">
             {selectedTable.name}
           </div>
         )}
      </div>
    </nav>
  );
}