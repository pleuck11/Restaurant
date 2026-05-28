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
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white drop-shadow-md">
            <Calendar className="text-white" size={24} /> จองโต๊ะ
          </h2>
          <p className="text-white/60 text-xs mt-1">กรอกข้อมูลเพื่อจองล่วงหน้า</p>
        </div>

        {/* Mobile Form */}
        <form onSubmit={handleSubmit} className="px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            {/* Name */}
            <div className="px-5 pt-5 pb-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อผู้จอง</label>
              <input 
                required 
                name="name" 
                type="text" 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-slate-800 placeholder-slate-300" 
                placeholder="คุณลูกค้า" 
              />
            </div>

            {/* Phone */}
            <div className="px-5 pb-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เบอร์โทรศัพท์</label>
              <input 
                required 
                name="phone" 
                type="tel" 
                maxLength={10}
                pattern="[0-9]{10}"
                title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-slate-800 placeholder-slate-300" 
                placeholder="08xxxxxxxx" 
              />
            </div>

            {/* Date & Time - side by side */}
            <div className="px-5 pb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar size={12} /> วันที่
                </label>
                <input 
                  required 
                  name="date" 
                  type="date" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-slate-800 min-h-[52px]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock size={12} /> เวลา
                </label>
                <input 
                  required 
                  name="time" 
                  type="time" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-slate-800 min-h-[52px]" 
                />
              </div>
            </div>

            {/* Guest Counter */}
            <div className="px-5 pb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">จำนวนคน</label>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <button 
                  type="button" 
                  onClick={() => adjustGuests(-1)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 active:scale-90 active:bg-slate-100 transition-all shadow-sm"
                >
                  <Minus size={20} />
                </button>
                
                <div className="flex-1 flex items-center justify-center relative">
                  <input 
                    required 
                    name="guests" 
                    type="number" 
                    min="1" 
                    value={guestCount}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-20 text-center bg-transparent border-none focus:bg-white/80 rounded-lg px-0 py-1 font-bold text-3xl text-slate-800 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all" 
                  />
                  <span className="text-sm text-slate-500 font-medium ml-1">ท่าน</span>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => adjustGuests(1)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white active:scale-90 transition-all shadow-lg shadow-orange-500/30"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Fixed Submit Button */}
          <div className="mt-4 px-1">
            <button 
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all"
            >
              ยืนยันการจอง
            </button>
          </div>
        </form>
      </div>

      {/* === DESKTOP LAYOUT (original) === */}
      <div className="hidden md:block p-4 md:p-8 max-w-lg mx-auto animate-fade-in pt-10 min-h-[calc(100vh-80px)]">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white drop-shadow-md">
            <Calendar className="text-white" /> จองโต๊ะ
        </h2>
        <GlassCard className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ชื่อผู้จอง</label>
                <input required name="name" type="text" className="w-full p-4 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none backdrop-blur-sm transition-all" placeholder="คุณลูกค้า" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">เบอร์โทรศัพท์</label>
              <input 
                required 
                name="phone" 
                type="tel" 
                maxLength={10}
                pattern="[0-9]{10}"
                title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }}
                className="w-full p-4 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none backdrop-blur-sm transition-all" 
                placeholder="08xxxxxxxx" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-500" /> วันที่
                </label>
                <input 
                    required 
                    name="date" 
                    type="date" 
                    className="w-full p-4 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none backdrop-blur-sm transition-all min-h-[56px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" /> เวลา
                </label>
                <input 
                    required 
                    name="time" 
                    type="time" 
                    className="w-full p-4 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none backdrop-blur-sm transition-all min-h-[56px]" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">จำนวนคน</label>
              <div className="flex items-center gap-3 bg-white/30 p-2 rounded-xl border border-white/40 backdrop-blur-sm transition-all hover:bg-white/40 group/counter">
                <GlassButton 
                  type="button" 
                  onClick={() => adjustGuests(-1)}
                  className="w-12 h-12 flex items-center justify-center !rounded-lg !bg-white/50 hover:!bg-white/80 !border-0 !shadow-sm text-slate-600 active:scale-90"
                >
                  <Minus size={20} />
                </GlassButton>
                
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
                            className="w-24 text-center bg-transparent border-b-2 border-transparent focus:border-orange-400 focus:bg-white/40 rounded px-0 py-1 font-bold text-3xl text-slate-800 drop-shadow-sm outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all placeholder-slate-300" 
                        />
                        <Pencil size={12} className="absolute top-0 right-0 text-slate-400 opacity-0 group-hover/counter:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium mt-2 ml-2">ท่าน</span>
                </div>
                
                <GlassButton 
                  type="button" 
                  onClick={() => adjustGuests(1)}
                  active
                  className="w-12 h-12 flex items-center justify-center !rounded-lg !shadow-md active:scale-90"
                >
                  <Plus size={20} className="text-white" />
                </GlassButton>
              </div>
            </div>

            <GlassButton type="submit" active className="w-full py-4 mt-6 text-lg shadow-lg hover:shadow-orange-500/40">
                ยืนยันการจอง
            </GlassButton>
            </form>
        </GlassCard>
      </div>
    </>
  );
}