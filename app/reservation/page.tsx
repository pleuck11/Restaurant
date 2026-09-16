'use client';
import { useState } from 'react';
import { Calendar, Minus, Plus, Pencil, Clock, ArrowLeft } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { useRestaurant } from '@/context/RestaurantContext';
import { useNotification } from '@/context/NotificationContext';
import Navbar from '@/components/Navbar';

export default function ReservationPage() {
  const { addReservation, reservations } = useRestaurant();
  const { showAlert } = useNotification();
  const [guestCount, setGuestCount] = useState<number | ''>(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const guestsValue = formData.get('guests');
    const guests = guestsValue ? parseInt(guestsValue.toString()) : 1;

    addReservation({
      name: formData.get('name'),
      date: formData.get('date'),
      time: formData.get('time'),
      guests: guests,
      phone: formData.get('phone'),
    });
    showAlert('จองโต๊ะสำเร็จ!', 'success');
    e.currentTarget.reset();
    setGuestCount(1); 
  };

  const adjustGuests = (amount: number) => {
    setGuestCount(prev => {
        const currentVal = prev === '' ? 0 : prev;
        return Math.max(1, currentVal + amount);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
        setGuestCount('');
    } else {
        const num = parseInt(val);
        if (!isNaN(num)) {
            setGuestCount(num);
        }
    }
  };

  const handleBlur = () => {
    if (guestCount === '' || guestCount < 1) {
        setGuestCount(1);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* === MOBILE LAYOUT === */}
      <div className="md:hidden animate-fade-in pb-6">
        {/* Mobile Header */}
        <div className="px-5 pt-4 pb-3">
          <h2 className="text-2xl font-black flex items-center gap-2 text-stone-900">
            <Calendar className="text-amber-600" size={24} /> จองโต๊ะ
          </h2>
          <p className="text-stone-500 text-xs mt-1">กรอกข้อมูลเพื่อจองล่วงหน้า</p>
        </div>

        {/* Mobile Form */}
        <form onSubmit={handleSubmit} className="px-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
            {/* Name */}
            <div className="px-5 pt-5 pb-3">
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">ชื่อผู้จอง</label>
              <input 
                required 
                name="name" 
                type="text" 
                className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-stone-800 placeholder-stone-400 text-sm" 
                placeholder="คุณลูกค้า" 
              />
            </div>

            {/* Phone */}
            <div className="px-5 pb-3">
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">เบอร์โทรศัพท์</label>
              <input 
                required 
                name="phone" 
                type="tel" 
                maxLength={10}
                pattern="[0-9]{10}"
                title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
                className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-stone-800 placeholder-stone-400 text-sm" 
                placeholder="08xxxxxxxx" 
              />
            </div>

            {/* Date & Time - side by side */}
            <div className="px-5 pb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar size={12} className="text-amber-600" /> วันที่
                </label>
                <input 
                  required 
                  name="date" 
                  type="date" 
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-stone-800 text-sm min-h-[52px]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock size={12} className="text-amber-600" /> เวลา
                </label>
                <input 
                  required 
                  name="time" 
                  type="time" 
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-stone-800 text-sm min-h-[52px]" 
                />
              </div>
            </div>

            {/* Guests Counter */}
            <div className="px-5 pb-5">
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">จำนวนคน</label>
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-2xl p-2">
                <button
                  type="button"
                  onClick={() => adjustGuests(-1)}
                  className="w-12 h-12 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-700 active:scale-90 transition cursor-pointer"
                >
                  <Minus size={20} />
                </button>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-stone-900">{guestCount}</span>
                  <span className="text-xs text-stone-500 font-medium">ท่าน</span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustGuests(1)}
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 shadow-xs flex items-center justify-center text-white active:scale-90 transition cursor-pointer"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              ยืนยันการจอง
            </button>
          </div>
        </form>
      </div>

      {/* === DESKTOP LAYOUT (original) === */}
      <div className="hidden md:block p-4 md:p-8 max-w-lg mx-auto animate-fade-in pt-10 min-h-[calc(100vh-80px)]">
        <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-stone-900">
            <Calendar className="text-amber-600" /> จองโต๊ะ
        </h2>
        <div className="p-6 md:p-8 bg-white border border-stone-200/80 shadow-xs rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
             <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">ชื่อผู้จอง</label>
                <input required name="name" type="text" className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-stone-800 text-sm" placeholder="คุณลูกค้า" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">เบอร์โทรศัพท์</label>
              <input 
                required 
                name="phone" 
                type="tel" 
                maxLength={10}
                pattern="[0-9]{10}"
                title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
                className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-stone-800 text-sm" 
                placeholder="08xxxxxxxx" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-amber-600" /> วันที่
                </label>
                <input 
                    required 
                    name="date" 
                    type="date" 
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-stone-800 text-sm min-h-[52px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" /> เวลา
                </label>
                <input 
                    required 
                    name="time" 
                    type="time" 
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-stone-800 text-sm min-h-[52px]" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">จำนวนคน</label>
              <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200 transition-all group/counter">
                <button 
                  type="button" 
                  onClick={() => adjustGuests(-1)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-white border border-stone-200 shadow-xs text-stone-600 active:scale-90 hover:bg-stone-100 transition cursor-pointer"
                >
                  <Minus size={18} />
                </button>
                
                <div className="flex-1 flex items-center justify-center relative">
                    <div className="relative">
                        <input 
                            required 
                            name="guests" 
                            type="number" 
                            min="1" 
                            value={guestCount}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-24 text-center bg-transparent border-b-2 border-transparent focus:border-amber-500 rounded px-0 py-1 font-black text-3xl text-stone-900 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all" 
                        />
                        <Pencil size={12} className="absolute top-0 right-0 text-stone-400 opacity-0 group-hover/counter:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm text-stone-600 font-medium ml-2">ท่าน</span>
                </div>

                <button 
                  type="button" 
                  onClick={() => adjustGuests(1)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs active:scale-90 hover:from-amber-600 hover:to-orange-700 transition cursor-pointer"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <GlassButton type="submit" active className="w-full py-4 mt-6 text-lg shadow-lg hover:shadow-orange-500/40">
                ยืนยันการจอง
            </GlassButton>
          </form>
        </div>
      </div>
    </>
  );
}