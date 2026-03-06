'use client';
import { useRouter } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { GlassButton } from '@/components/ui/Glass';
import { useRestaurant, TABLES } from '@/context/RestaurantContext';
import Navbar from '@/components/Navbar';

export default function ScanPage() {
  const router = useRouter();
  const { setSelectedTable } = useRestaurant();

  const handleTableSelect = (table: any) => {
    setSelectedTable(table);
    // ในสถานการณ์จริง อาจจะเก็บ tableId ลงใน LocalStorage หรือ URL query param
    router.push('/ordering');
  };

  return (
    <>
      <Navbar />
      <div className="p-6 text-center max-w-2xl mx-auto animate-fade-in flex flex-col justify-center min-h-[80vh]">
        <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-md">ระบุโต๊ะของคุณ</h2>
        <p className="text-white/80 mb-10 text-lg">จำลองการสแกน QR Code ที่แปะอยู่บนโต๊ะอาหาร</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TABLES.map(table => (
            <GlassButton
                key={table.id}
                onClick={() => handleTableSelect(table)}
                className="p-6 flex flex-col items-center gap-3 aspect-square justify-center hover:bg-white/60 group"
            >
                <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-4 rounded-full text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <QrCode size={24} />
                </div>
                <span className="font-bold text-slate-700 text-lg group-hover:text-pink-600 transition-colors">{table.name}</span>
            </GlassButton>
            ))}
        </div>
      </div>
    </>
  );
}