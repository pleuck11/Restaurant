'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Clock, CheckCircle, Bell, Lock, KeyRound, Receipt } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { useRestaurant, TABLES } from '@/context/RestaurantContext';
import Navbar from '@/components/Navbar';

export default function KitchenPage() {
  const router = useRouter();
  const { orders, updateOrderStatus, confirmPayment } = useRestaurant();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

  // เรียงลำดับออเดอร์: รอปรุง -> กำลังปรุง -> เสร็จแล้ว -> เรียกบิล
  // กรอง 'paid' ออก เพื่อไม่ให้รกหน้าครัว
  const sortedOrders = orders
    .filter(o => o.status !== 'paid') 
    .sort((a, b) => {
      const statusPriority: Record<string, number> = { 
        'pending': 1, 
        'cooking': 2, 
        'served': 3, 
        'bill_requested': 4 
      };
      
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pending': return 'from-red-500 to-rose-500 shadow-red-500/30';
      case 'cooking': return 'from-amber-400 to-orange-500 shadow-orange-500/30';
      case 'served': return 'from-emerald-400 to-green-500 shadow-green-500/30';
      case 'bill_requested': return 'from-purple-500 to-indigo-500 shadow-purple-500/30';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const handleAdminAccess = () => {
    if (pin === '1234') { 
      setShowPinModal(false);
      router.push('/admin/dashboard');
    } else {
      alert('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
      setPin('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-8 animate-fade-in relative min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white drop-shadow-md">
            <ChefHat className="text-white" size={32} /> 
            Kitchen Display System
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
             <button 
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all text-sm font-medium"
             >
                <Lock size={16} /> Admin Panel
             </button>

             <div className="flex gap-4 bg-black/20 p-2 rounded-full backdrop-blur-sm px-4 overflow-x-auto">
                <div className="flex items-center gap-2 text-white text-sm whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div> รอปรุง</div>
                <div className="flex items-center gap-2 text-white text-sm whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_orange]"></div> กำลังปรุง</div>
                <div className="flex items-center gap-2 text-white text-sm whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_green]"></div> เสร็จสิ้น</div>
             </div>
          </div>
        </div>

        {sortedOrders.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-white/30 !bg-white/20">
            <Bell size={48} className="mb-4 opacity-50 text-white" />
            <p className="text-xl text-white font-medium">ยังไม่มีออเดอร์เข้ามา</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOrders.map(order => (
              <div key={order.id} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusStyle(order.status)} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200`}></div>
                
                <GlassCard className="relative flex flex-col h-full !bg-white/80 overflow-hidden border-0">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${getStatusStyle(order.status)}`}></div>
                    
                    <div className="p-4 flex justify-between items-start border-b border-slate-100">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                {TABLES.find(t => t.id === order.tableId)?.name || `โต๊ะ ${order.tableId}`}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                            <Clock size={12} /> {new Date(order.timestamp).toLocaleTimeString('th-TH')}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm bg-gradient-to-r ${getStatusStyle(order.status)}`}>
                            {order.status === 'pending' ? 'Waiting' : order.status === 'cooking' ? 'Cooking' : order.status === 'bill_requested' ? 'Bill' : 'Done'}
                        </span>
                    </div>

                    <div className="p-4 flex-1">
                        <ul className="space-y-3">
                            {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-slate-700">
                                <span className="flex items-center gap-3">
                                <span className="font-bold bg-slate-200 w-8 h-8 flex items-center justify-center rounded-lg text-sm text-slate-700 shadow-inner">
                                    {item.qty}
                                </span> 
                                <span className="font-medium">{item.name}</span>
                                </span>
                            </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                        {order.status === 'pending' && (
                            <button 
                            onClick={() => updateOrderStatus(order.id, 'cooking')}
                            className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition active:scale-95"
                            >
                            รับออเดอร์
                            </button>
                        )}
                        {order.status === 'cooking' && (
                            <button 
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="flex-1 bg-gradient-to-r from-emerald-400 to-green-500 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition active:scale-95"
                            >
                            พร้อมเสิร์ฟ
                            </button>
                        )}
                        {order.status === 'served' && (
                            <div className="flex-1 text-center text-green-600 font-bold py-3 flex items-center justify-center gap-2 bg-green-50 rounded-xl">
                            <CheckCircle size={20} /> เสิร์ฟแล้ว
                            </div>
                        )}
                         {order.status === 'bill_requested' && (
                            <button
                                onClick={() => confirmPayment(order.tableId)}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Receipt size={20} /> ยืนยันรับเงิน
                            </button>
                        )}
                    </div>
                </GlassCard>
              </div>
            ))}
          </div>
        )}

        {/* PIN Modal remains same */}
        {showPinModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
                <GlassCard className="p-8 w-full max-w-sm flex flex-col items-center !bg-white">
                    <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-4">
                        <KeyRound size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">เข้าสู่ระบบผู้ดูแล</h3>
                    <p className="text-slate-500 mb-6 text-sm text-center">
                        กรุณากรอกรหัส PIN 4 หลักเพื่อเข้าสู่หน้า Admin Dashboard <br/>
                        <span className="text-xs text-orange-400">(รหัสทดสอบ: 1234)</span>
                    </p>
                    
                    <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
                        className="w-full text-center text-3xl tracking-[0.5em] p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-orange-500 outline-none text-slate-800 font-bold placeholder:tracking-normal placeholder:text-slate-300 placeholder:text-lg"
                        placeholder="PIN"
                        maxLength={4}
                        autoFocus
                    />
                    
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => { setShowPinModal(false); setPin(''); }}
                            className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                        >
                            ยกเลิก
                        </button>
                        <GlassButton 
                            onClick={handleAdminAccess} 
                            active 
                            className="flex-1 py-3 shadow-lg"
                        >
                            ยืนยัน
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        )}
      </div>
    </>
  );
}