'use client';
import { useState } from 'react';
import { Calendar, Minus, Plus, Pencil, Clock } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { useRestaurant } from '@/context/RestaurantContext';
import Navbar from '@/components/Navbar';

export default function ReservationPage() {
  const { addReservation, reservations } = useRestaurant();
  const [guestCount, setGuestCount] = useState<number | ''>(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const guestsValue = formData.get('guests');
    const guests = guestsValue ? parseInt(guestsValue.toString()) : 1;

    addReservation({
      id: Date.now(),
      name: formData.get('name'),
      date: formData.get('date'),
      time: formData.get('time'),
      guests: guests,
      phone: formData.get('phone'),
    });
    alert('จองโต๊ะสำเร็จ!');
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
      <div className="p-4 md:p-8 max-w-lg mx-auto animate-fade-in pt-10 min-h-[calc(100vh-80px)]">
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
              <input required name="phone" type="tel" className="w-full p-4 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none backdrop-blur-sm transition-all" placeholder="08x-xxx-xxxx" />
            </div>
            
            {/* Grid Layout: 1 Column on Mobile, 2 Columns on Desktop */}
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
            
            {/* Custom Guest Counter */}
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

        {reservations.length > 0 && (
          <div className="mt-8 pb-8">
            <h3 className="font-bold text-white mb-4 text-xl drop-shadow-md">รายการจองล่าสุด</h3>
            <div className="space-y-3">
              {reservations.map((res: any) => (
                <GlassCard key={res.id} className="p-4 flex justify-between items-center bg-white/60 hover:scale-[1.02] transition-transform duration-200">
                  <div>
                    <div className="font-bold text-slate-800">{res.name} ({res.guests} ท่าน)</div>
                    <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Calendar size={12} /> {new Date(res.date).toLocaleDateString('th-TH')} 
                        <Clock size={12} className="ml-1" /> {res.time} น.
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      res.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                      res.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-orange-500/20 text-orange-700 border-orange-500/30'
                  }`}>
                    {res.status === 'confirmed' ? 'ยืนยันแล้ว' : res.status === 'cancelled' ? 'ยกเลิก' : 'รอการยืนยัน'}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}