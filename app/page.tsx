'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Utensils, 
  Calendar, 
  QrCode, 
  ChefHat, 
  LayoutDashboard, 
  RotateCcw, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Users
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { useRestaurant, TABLES } from '@/context/RestaurantContext';
import { useNotification } from '@/context/NotificationContext';
import { RESTAURANT_INFO } from '@/data/restaurantInfo';
import DishImage from '@/components/DishImage';

export default function Home() {
  const router = useRouter();
  const { menuItems, orders, resetDemoData, setSelectedTable } = useRestaurant();
  const { showConfirm, showAlert } = useNotification();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeOrdersCount = orders.filter(o => o.status !== 'paid').length;
  const signatureDishes = menuItems.filter(item => item.isSignature || item.isPopular).slice(0, 6);

  const handleQuickOrder = (tableId: number) => {
    const table = TABLES.find(t => t.id === tableId) || TABLES[0];
    setSelectedTable(table);
    router.push('/ordering');
  };

  const handleResetDemo = () => {
    showConfirm('ต้องการรีเซ็ตข้อมูลระบบกลับสู่ค่าเริ่มต้นของเดโมหรือไม่? (เมนู, ออเดอร์, การจอง)', () => {
      resetDemoData();
      showAlert('รีเซ็ตข้อมูลตัวอย่างเดโมเรียบร้อยแล้ว!', 'success');
    });
  };

  return (
    <div className="min-h-screen pb-24 text-stone-800 relative z-10">
      {/* Top Demo Banner */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-stone-200/80 px-4 py-2.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-bold text-stone-800 tracking-wide">
              ระบบเดโมร้านอาหารจำลอง <span className="text-stone-400 font-normal hidden sm:inline">(Interactive Demo)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 text-xs bg-stone-100 hover:bg-stone-200/70 text-stone-700 px-3 py-1.5 rounded-full border border-stone-200/70 transition active:scale-95 cursor-pointer font-medium shadow-xs"
              title="รีเซ็ตข้อมูลเริ่มต้น"
            >
              <RotateCcw size={13} />
              <span>รีเซ็ตเดโม</span>
            </button>
            <Link href="/admin/dashboard">
              <button className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3.5 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer font-medium">
                <LayoutDashboard size={13} />
                <span>แดชบอร์ด</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 md:pt-10 space-y-10 animate-fade-in">
        
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center">
          <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-stone-200/70 mb-4 inline-flex items-center justify-center">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3.5 md:p-4 rounded-2xl text-white shadow-xs">
              <Utensils size={36} className="drop-shadow-xs" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight">
            {RESTAURANT_INFO.name}
          </h1>
          <p className="text-stone-600 text-sm md:text-lg max-w-xl mt-2 font-normal">
            {RESTAURANT_INFO.tagline}
          </p>
        </section>

        {/* 4 Core Demo Service Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-stone-900">
              เลือกระบบที่ต้องการทดสอบ
            </h2>
            <span className="text-xs text-stone-500">กดเพื่อเริ่มทดลองใช้งาน</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. สแกนสั่งอาหาร */}
            <Link href="/scan" className="group">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white">
                    <QrCode size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-white">สแกนสั่งอาหาร</h3>
                  <p className="text-white/85 text-xs mt-1 leading-relaxed">
                    จำลองการสแกน QR Code ประจำโต๊ะ เลือกเมนูภาพถ่ายจริง และส่งรายการเข้าครัว
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
                  <span>ทดลองสั่งอาหาร</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* 2. จองโต๊ะล่วงหน้า */}
            <Link href="/reservation" className="group">
              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="bg-rose-50 text-rose-600 border border-rose-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-xs">
                    <Calendar size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-stone-900">จองโต๊ะล่วงหน้า</h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    ระบบจองโต๊ะ ระบุวันเวลา จำนวนแขก และบันทึกข้อมูลการจองแบบเรียลไทม์
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                  <span>ไปหน้าจองโต๊ะ</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* 3. หน้าจอห้องครัว */}
            <Link href="/kitchen" className="group">
              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden">
                {isClient && activeOrdersCount > 0 && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    {activeOrdersCount} ออเดอร์
                  </span>
                )}
                <div>
                  <div className="bg-amber-50 text-amber-700 border border-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-xs">
                    <ChefHat size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-stone-900">หน้าจอห้องครัว (KDS)</h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    สำหรับเชฟและพนักงานครัว: เปลี่ยนสถานะ รอปรุง กำลังปรุง เสิร์ฟแล้ว และชำระเงิน
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                  <span>ดูออเดอร์ในครัว</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* 4. จัดการร้าน Admin */}
            <Link href="/admin/dashboard" className="group">
              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="bg-stone-100 text-stone-700 border border-stone-200 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-xs">
                    <LayoutDashboard size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-stone-900">แดชบอร์ดจัดการ</h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    สถิติยอดขาย เมนูขายดี จัดการรายการอาหารและการจอง
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>เข้าสู่ระบบหลังร้าน</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Menu Showcase */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-amber-600" />
                <h2 className="text-2xl font-black text-stone-900">
                  เมนูเด็ดแนะนำประจำร้าน (Signature Dishes)
                </h2>
              </div>
              <p className="text-stone-500 text-xs mt-1">
                รูปถ่ายจากอาหารจริง คัดสรรวัตถุดิบคุณภาพ รสชาติตำรับไทยแท้
              </p>
            </div>
            <Link href="/scan">
              <button className="bg-stone-100 hover:bg-stone-200/70 text-stone-800 text-xs font-bold px-4 py-2 rounded-xl border border-stone-200/70 transition active:scale-95 cursor-pointer">
                ดูเมนูทั้งหมด ({menuItems.length} รายการ)
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {signatureDishes.map(item => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex gap-3.5 group"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shadow-inner border border-stone-200 shrink-0 relative bg-stone-100">
                  <DishImage 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  {item.spicyLevel && item.spicyLevel > 0 ? (
                    <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-[9px] px-1 py-0.2 rounded text-white">
                      {'🌶️'.repeat(Math.min(item.spicyLevel, 3))}
                    </span>
                  ) : null}
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-stone-900 text-sm leading-tight truncate">
                        {item.name}
                      </h4>
                      {item.isSignature && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                          สูตรเด็ด
                        </span>
                      )}
                    </div>
                    {item.nameEn && (
                      <span className="text-[10px] text-stone-400 block truncate">{item.nameEn}</span>
                    )}
                    {item.description && (
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-snug">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                    <span className="font-extrabold text-amber-700 text-base">฿{item.price}</span>
                    <button
                      onClick={() => handleQuickOrder(1)}
                      className="text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3 py-1 rounded-lg font-bold shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      สั่งเมนูนี้
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Table Selector Simulator */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Users size={20} className="text-amber-600" />
                จำลองการนั่งโต๊ะอาหาร (Table Quick Select)
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                แตะที่โต๊ะเพื่อจำลองการสแกนและเริ่มสั่งอาหารประจำโต๊ะนั้นทันที
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {TABLES.map(table => (
              <button
                key={table.id}
                onClick={() => handleQuickOrder(table.id)}
                className="bg-white hover:bg-stone-50 p-3 rounded-2xl border border-stone-200/80 shadow-xs hover:border-amber-400/80 hover:shadow-sm transition active:scale-95 text-center group cursor-pointer"
              >
                <span className="text-xs text-stone-400 block">{table.seats} ที่นั่ง</span>
                <span className="font-bold text-stone-900 text-sm block group-hover:text-amber-700 transition">
                  {table.name}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  คลิกเพื่อสั่ง
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Restaurant Practical Info Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Restaurant Info">
          {/* Info Card 1: เวลาเปิดทำการ */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">เวลาเปิดให้บริการ</h4>
              <p className="text-xs text-stone-600 mt-1">ทุกวัน: 10:30 น. - 22:00 น.</p>
              <p className="text-[11px] text-stone-400 mt-0.5">รับออเดอร์สุดท้าย 21:30 น.</p>
            </div>
          </div>

          {/* Info Card 2: สถานที่ตั้ง */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">สถานที่ตั้งร้าน</h4>
              <p className="text-xs text-stone-600 mt-1">สุขุมวิท ซอย 23 กรุงเทพฯ</p>
              <p className="text-[11px] text-stone-400 mt-0.5">มีที่จอดรถสะดวกสบาย</p>
            </div>
          </div>

          {/* Info Card 3: ติดต่อสอบถาม (Wireframe / Blurred) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900">สำรองที่นั่ง & ติดต่อ</h4>
                <span className="text-[10px] text-stone-400 bg-stone-100 border border-stone-200/80 px-1.5 py-0.5 rounded font-mono">
                  Wireframe
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-medium">โทร:</span>
                  <span className="inline-block bg-stone-100 border border-stone-200/60 rounded px-2 py-0.5 text-xs text-stone-800 font-mono filter blur-[4.5px] select-none">
                    02-123-4567
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-medium">LINE:</span>
                  <span className="inline-block bg-emerald-50 border border-emerald-200/60 rounded px-2 py-0.5 text-xs text-emerald-800 font-mono filter blur-[4.5px] select-none">
                    @imkhanad
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}