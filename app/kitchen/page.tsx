'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Clock, CheckCircle, Bell, LayoutDashboard, Receipt } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { useRestaurant, TABLES } from '@/context/RestaurantContext';
import { useNotification } from '@/context/NotificationContext';
import Navbar from '@/components/Navbar';

export default function KitchenPage() {
  const { orders, updateOrderStatus, confirmPayment } = useRestaurant();
  const { showAlert } = useNotification();
  const [selectedBills, setSelectedBills] = useState<string[]>([]);

  const toggleBillSelection = (orderId: string) => {
    setSelectedBills(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleBulkPayment = async () => {
    if (selectedBills.length === 0) return;
    await confirmPayment(selectedBills);
    setSelectedBills([]);
    showAlert(`ชำระเงินสำเร็จ ${selectedBills.length} รายการ`, 'success');
  };

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
      case 'cooking': return 'from-amber-500 to-orange-500 shadow-orange-500/30';
      case 'served': return 'from-emerald-500 to-teal-600 shadow-emerald-500/30';
      case 'bill_requested': return 'from-amber-600 to-orange-600 shadow-orange-500/30';
      default: return 'from-stone-400 to-stone-500';
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-8 animate-fade-in relative min-h-screen max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-black flex items-center gap-3 text-stone-900">
            <ChefHat className="text-amber-600" size={32} /> 
            Kitchen Display System
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
             <Link 
                href="/admin/dashboard"
                className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-4 py-2 rounded-full border border-stone-200 shadow-xs transition-all text-sm font-medium cursor-pointer"
             >
                <LayoutDashboard size={16} className="text-amber-600" /> Admin Dashboard
             </Link>

             <div className="flex gap-4 bg-white border border-stone-200 p-2 rounded-full shadow-xs px-4 overflow-x-auto">
                <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> รอปรุง</div>
                <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> กำลังปรุง</div>
                <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> เสร็จสิ้น</div>
             </div>
          </div>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400 border-2 border-dashed border-stone-200 bg-white rounded-3xl shadow-xs">
            <Bell size={48} className="mb-4 opacity-40 text-stone-400" />
            <p className="text-lg text-stone-600 font-bold">ยังไม่มีออเดอร์เข้ามา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOrders.map(order => (
              <div key={order.id} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusStyle(order.status)} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
                
                <GlassCard className="relative flex flex-col h-full bg-white overflow-hidden border border-stone-200/80 shadow-xs rounded-2xl">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${getStatusStyle(order.status)}`}></div>
                    
                    <div className="p-4 flex justify-between items-start border-b border-stone-100">
                        <div>
                            <h3 className="text-2xl font-black text-stone-800 tracking-tight">
                                {TABLES.find(t => t.id === order.tableId)?.name || `โต๊ะ ${order.tableId}`}
                            </h3>
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 font-medium">
                            <Clock size={12} /> {new Date(order.timestamp).toLocaleTimeString('th-TH')}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-xs bg-gradient-to-r ${getStatusStyle(order.status)}`}>
                            {order.status === 'pending' ? 'Waiting' : order.status === 'cooking' ? 'Cooking' : order.status === 'bill_requested' ? 'Bill' : 'Done'}
                        </span>
                    </div>

                    <div className="p-4 flex-1">
                        <ul className="space-y-3">
                            {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-stone-700">
                                <span className="flex items-center gap-3">
                                <span className="font-bold bg-stone-100 w-8 h-8 flex items-center justify-center rounded-lg text-sm text-stone-800 shadow-xs border border-stone-200">
                                    {item.qty}
                                </span> 
                                <span className="font-semibold text-stone-800">{item.name}</span>
                                </span>
                            </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-3 bg-stone-50 border-t border-stone-100 flex gap-2">
                        {order.status === 'pending' && (
                            <button 
                            onClick={() => updateOrderStatus(order.id, 'cooking')}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-xs hover:from-amber-600 hover:to-orange-700 transition active:scale-95 cursor-pointer"
                            >
                            รับออเดอร์
                            </button>
                        )}
                        {order.status === 'cooking' && (
                            <button 
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-bold shadow-xs hover:from-emerald-600 hover:to-teal-700 transition active:scale-95 cursor-pointer"
                            >
                            พร้อมเสิร์ฟ
                            </button>
                        )}
                        {order.status === 'served' && (
                            <div className="flex-1 text-center text-emerald-700 font-bold py-3 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                            <CheckCircle size={20} /> เสิร์ฟแล้ว
                            </div>
                        )}
                         {order.status === 'bill_requested' && (
                            <button
                                onClick={() => toggleBillSelection(order.id)}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                                    selectedBills.includes(order.id) 
                                    ? 'bg-amber-100 text-amber-900 border-2 border-amber-500'
                                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                                }`}
                            >
                                <Receipt size={20} /> {selectedBills.includes(order.id) ? 'เลือกแล้ว' : 'เลือกรับเงิน'}
                            </button>
                        )}
                    </div>
                </GlassCard>
              </div>
            ))}
          </div>
        )}

        {/* Floating Bulk Payment Button */}
        {selectedBills.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                <GlassButton 
                    onClick={handleBulkPayment}
                    active
                    className="!bg-gradient-to-r !from-amber-500 !to-orange-600 !text-white px-8 py-4 !rounded-full shadow-2xl text-lg font-bold flex items-center gap-3 border-2 border-white/40 hover:scale-105 transition-all"
                >
                    <Receipt size={24} />
                    ยืนยันรับเงิน {selectedBills.length} บิล
                </GlassButton>
            </div>
        )}
      </div>
    </>
  );
}