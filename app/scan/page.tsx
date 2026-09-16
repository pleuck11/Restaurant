'use client';
import { useRouter } from 'next/navigation';
import { QrCode, Wifi } from 'lucide-react';
import { GlassButton } from '@/components/ui/Glass';
import { useRestaurant, TABLES } from '@/context/RestaurantContext';
import Navbar from '@/components/Navbar';

export default function ScanPage() {
  const router = useRouter();
  const { setSelectedTable } = useRestaurant();

  const handleTableSelect = (table: any) => {
    setSelectedTable(table);
    router.push('/ordering');
  };

  return (
    <>
      <Navbar />

      {/* === MOBILE LAYOUT === */}
      <div className="md:hidden animate-fade-in pb-6">
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-2xl font-black text-stone-900">ระบุโต๊ะของคุณ</h2>
          <p className="text-stone-500 text-xs mt-1 flex items-center gap-1">
            <Wifi size={12} /> แตะเพื่อเลือกโต๊ะ
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 mt-2">
          {TABLES.map(table => (
            <button
              key={table.id}
              onClick={() => handleTableSelect(table)}
              className="bg-white border border-stone-200/80 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xs active:scale-95 hover:border-amber-400 transition-all duration-200 text-center cursor-pointer"
            >
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl text-white shadow-xs">
                <QrCode size={26} />
              </div>
              <div>
                <span className="font-bold text-stone-900 text-base block">{table.name}</span>
                <span className="text-[11px] text-stone-500 block">{table.seats} ที่นั่ง</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* === DESKTOP LAYOUT (original) === */}
      <div className="hidden md:flex flex-col p-6 text-center max-w-3xl mx-auto animate-fade-in justify-center min-h-[80vh]">
        <h2 className="text-4xl font-black mb-2 text-stone-900">ระบุโต๊ะของคุณ</h2>
        <p className="text-stone-600 mb-8 text-base">จำลองการสแกน QR Code ที่แปะอยู่บนโต๊ะอาหารเพื่อเริ่มสั่งอาหาร</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TABLES.map(table => (
            <button
                key={table.id}
                onClick={() => handleTableSelect(table)}
                className="bg-white border border-stone-200/80 hover:border-amber-500 hover:shadow-md p-5 flex flex-col items-center gap-2 aspect-square justify-center rounded-2xl transition-all group cursor-pointer shadow-xs active:scale-95"
            >
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3.5 rounded-2xl text-white shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <QrCode size={26} />
                </div>
                <div>
                  <span className="font-bold text-stone-900 text-lg group-hover:text-amber-700 transition-colors block">{table.name}</span>
                  <span className="text-xs text-stone-500 block mt-0.5">{table.seats} ที่นั่ง</span>
                </div>
            </button>
            ))}
        </div>
      </div>
    </>
  );
}