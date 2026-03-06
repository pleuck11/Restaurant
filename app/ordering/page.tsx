'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Receipt, Minus, Plus, Search, History, Clock, Loader2, CheckCircle, Hourglass, ListChecks } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { useRestaurant, MENU_ITEMS } from '@/context/RestaurantContext';
import Navbar from '@/components/Navbar';

export default function OrderingPage() {
  const router = useRouter();
  const { cart, selectedTable, addToCart, updateQty, placeOrder, orders, checkBill } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [sidebarTab, setSidebarTab] = useState<'cart' | 'bill'>('cart');
  
  // States for Bill Process
  const [isWaitingForBill, setIsWaitingForBill] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  
  // State for Order Confirmation
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);

  // ถ้าไม่ได้เลือกโต๊ะ ให้เด้งกลับไปหน้า Scan
  useEffect(() => {
    if (!selectedTable) {
      router.push('/scan');
    }
  }, [selectedTable, router]);

  // Check if bill has been requested
  const tableOrders = orders.filter(o => o.tableId === selectedTable?.id);
  const hasBillRequested = tableOrders.some(o => o.status === 'bill_requested');

  // Monitor Payment Success
  useEffect(() => {
    if (isWaitingForBill && tableOrders.length === 0) {
        // ออเดอร์หายไปหมดแล้ว = Admin เคลียร์โต๊ะแล้ว
        setIsWaitingForBill(false);
        setIsPaymentSuccess(true);
        
        // Redirect after success
        setTimeout(() => {
            router.push('/');
        }, 3000);
    }
  }, [tableOrders, isWaitingForBill, router]);

  // Set waiting state if we detect status from DB (in case of page reload)
  useEffect(() => {
    if (hasBillRequested) {
        setIsWaitingForBill(true);
    }
  }, [hasBillRequested]);

  if (!selectedTable) return null;

  const categories = ['ทั้งหมด', ...new Set(MENU_ITEMS.map(i => i.category))];
  const filteredMenu = selectedCategory === 'ทั้งหมด' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(i => i.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 0)), 0);
  
  const billTotal = tableOrders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => sum + (item.price * (item.qty || 0)), 0);
  }, 0);

  const handlePlaceOrderClick = () => {
    if (cart.length > 0) {
      setIsConfirmingOrder(true);
    }
  };

  const handleConfirmOrder = async () => {
    await placeOrder();
    setIsConfirmingOrder(false);
    alert('ส่งรายการอาหารเข้าครัวเรียบร้อยแล้ว!');
  };

  const handleCheckBill = async () => {
    if (window.confirm(`ยืนยันการเช็คบิลโต๊ะ ${selectedTable.name}?`)) {
        await checkBill();
        setIsWaitingForBill(true);
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 p-2 md:p-4 animate-fade-in relative">
        
        {/* --- MENU --- */}
        {/* แก้ไข: เพิ่ม Padding Bottom (pb-40) ให้เยอะขึ้น เพื่อไม่ให้ Bottom Sheet บัง */}
        <div className="flex-1 overflow-y-auto pb-40 md:pb-0 pr-0 md:pr-2 scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-transparent">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white drop-shadow-md">เมนูอาหาร</h2>
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full mt-2">
                <span className="text-sm text-white font-medium">สั่งให้: {selectedTable.name}</span>
              </div>
            </div>
            <GlassCard className="p-2 flex items-center !rounded-full !bg-white/30 px-4 w-full md:w-auto">
               <Search size={20} className="text-white/70 mr-2" />
               <input type="text" placeholder="ค้นหาเมนู..." className="bg-transparent border-none outline-none text-white placeholder-white/50 w-full" />
            </GlassCard>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 shadow-sm backdrop-blur-sm ${
                  selectedCategory === cat 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-105' 
                  : 'bg-white/40 text-slate-700 hover:bg-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map(item => (
              <GlassCard key={item.id} className="p-4 flex gap-4 hover:scale-[1.02] transition-transform duration-300 !bg-white/60">
                <div className="text-5xl bg-gradient-to-br from-white/40 to-white/10 w-24 h-24 flex items-center justify-center rounded-2xl shadow-inner border border-white/40">
                  {item.image}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{item.name}</h3>
                    <span className="text-xs text-slate-500 bg-white/50 px-2 py-1 rounded-md">{item.category}</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-pink-600 text-lg">฿{item.price}</span>
                    <button 
                      onClick={() => { addToCart(item); setSidebarTab('cart'); }}
                      className="bg-gradient-to-r from-orange-400 to-pink-500 text-white p-2 rounded-xl shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* --- SIDEBAR --- */}
        <GlassCard className={`fixed bottom-0 left-0 right-0 md:relative md:w-[400px] !bg-white/80 md:!bg-white/40 backdrop-blur-xl border-t md:border-l border-white/50 flex flex-col transition-all duration-500 z-40 ${cart.length > 0 || sidebarTab === 'bill' ? 'h-[75vh] md:h-auto md:rounded-2xl rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)]' : 'h-24 md:h-auto overflow-hidden md:rounded-2xl rounded-t-3xl'}`}>
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
          </div>

          <div className="flex border-b border-white/30 p-2 gap-2 mt-2 md:mt-0">
            <button 
                onClick={() => setSidebarTab('cart')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${sidebarTab === 'cart' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:bg-white/30'}`}
            >
                <ShoppingBag size={18} /> ตะกร้า ({cart.reduce((s, i) => s + (i.qty || 0), 0)})
            </button>
            <button 
                onClick={() => setSidebarTab('bill')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${sidebarTab === 'bill' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:bg-white/30'}`}
            >
                <Receipt size={18} /> บิล (฿{billTotal})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:h-full scrollbar-thin scrollbar-thumb-white/50">
            {sidebarTab === 'cart' ? (
                <>
                    {cart.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                        <ShoppingBag size={40} className="opacity-50 mb-2" />
                        <p className="font-medium">ตะกร้าว่างเปล่า</p>
                    </div>
                    ) : (
                    <div className="space-y-3">
                        {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-white/40">
                            <div>
                            <div className="font-bold text-slate-800">{item.name}</div>
                            <div className="text-xs text-slate-500">฿{item.price}</div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/50 rounded-lg p-1 shadow-inner">
                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-600 hover:scale-105"><Minus size={14} /></button>
                            <span className="w-6 text-center font-bold text-slate-700">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:scale-105"><Plus size={14} /></button>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </>
            ) : (
                <>
                     {tableOrders.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                            <History size={40} className="opacity-50 mb-2" />
                            <p className="font-medium">ยังไม่มีรายการสั่ง</p>
                        </div>
                     ) : (
                         <div className="space-y-4">
                             {tableOrders.map((order) => (
                                 <div key={order.id} className="bg-white/40 rounded-xl p-4 border border-white/50">
                                     <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200/50">
                                         <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.timestamp).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                                         </span>
                                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                             order.status === 'served' ? 'bg-green-100 text-green-700 border-green-200' : 
                                             order.status === 'cooking' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                             order.status === 'bill_requested' ? 'bg-red-100 text-red-700 border-red-200' :
                                             'bg-gray-100 text-gray-700 border-gray-200'
                                         }`}>
                                             {order.status === 'served' ? 'เสิร์ฟแล้ว' : order.status === 'cooking' ? 'กำลังทำ' : order.status === 'bill_requested' ? 'เรียกบิลแล้ว' : 'รอคิว'}
                                         </span>
                                     </div>
                                     <div className="space-y-2">
                                         {order.items.map((item, iIdx) => (
                                             <div key={`${order.id}-${iIdx}`} className="flex justify-between text-sm">
                                                 <span className="text-slate-700 font-medium">{item.name} <span className="text-slate-400 text-xs">x{item.qty}</span></span>
                                                 <span className="font-bold text-slate-600">฿{item.price * (item.qty || 0)}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             ))}
                             
                             <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-xl text-white shadow-lg mt-4">
                                 <div className="flex justify-between mb-2 text-slate-300 text-sm">
                                     <span>ยอดรวมทั้งสิ้น</span>
                                     <span>฿{billTotal}</span>
                                 </div>
                                 <div className="flex justify-between text-2xl font-bold">
                                     <span>สุทธิ</span>
                                     <span className="text-orange-400">฿{billTotal}</span>
                                 </div>
                             </div>
                         </div>
                     )}
                </>
            )}
          </div>

          <div className="p-4 border-t border-white/30 bg-white/40 backdrop-blur-md">
            {sidebarTab === 'cart' ? (
                <>
                    <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-800">
                        <span>ยอดรวม ({cart.reduce((s,i)=>s+(i.qty||0),0)} จาน)</span>
                        <span className="text-pink-600 text-xl">฿{cartTotal}</span>
                    </div>
                    {/* เปลี่ยน onClick เป็น handlePlaceOrderClick เพื่อเปิด Modal */}
                    <GlassButton onClick={handlePlaceOrderClick} disabled={cart.length === 0} active={cart.length > 0} className="w-full py-3.5 text-lg shadow-xl">
                        ยืนยันสั่งอาหาร
                    </GlassButton>
                </>
            ) : (
                <button 
                    onClick={handleCheckBill}
                    disabled={billTotal === 0 || hasBillRequested}
                    className={`w-full py-3.5 rounded-xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                        hasBillRequested 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                >
                    {hasBillRequested ? 'รอการตรวจสอบ...' : <><Receipt size={20} /> เช็คบิล / ชำระเงิน</>}
                </button>
            )}
          </div>
        </GlassCard>

        {/* --- MODAL: Confirm Order Items --- */}
        {isConfirmingOrder && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-6">
                <GlassCard className="p-6 w-full max-w-md flex flex-col !bg-white/95 shadow-2xl max-h-[80vh]">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                            <ListChecks size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">ทบทวนรายการอาหาร</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="bg-orange-100 text-orange-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-xs shadow-sm">{item.qty}x</span>
                                    <div className="flex flex-col">
                                        <span className="text-slate-800 font-medium">{item.name}</span>
                                        <span className="text-slate-400 text-xs">{item.category}</span>
                                    </div>
                                </div>
                                <span className="text-slate-600 font-bold">฿{(item.price * (item.qty || 1)).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4 text-white mb-6 shadow-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">ยอดรวมทั้งสิ้น</span>
                            <span className="font-bold text-2xl text-orange-400">฿{cartTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsConfirmingOrder(false)}
                            className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition border border-slate-200"
                        >
                            แก้ไขรายการ
                        </button>
                        <GlassButton 
                            onClick={handleConfirmOrder} 
                            active 
                            className="flex-[1.5] py-3 shadow-lg bg-gradient-to-r from-orange-500 to-pink-500 border-0"
                        >
                            ยืนยันสั่งเลย
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        )}

        {/* --- MODAL: Waiting for Payment --- */}
        {isWaitingForBill && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-6">
                <GlassCard className="p-8 w-full max-w-sm flex flex-col items-center !bg-white/95 text-center shadow-2xl">
                    <div className="bg-orange-100 p-6 rounded-full text-orange-600 mb-6 animate-pulse">
                        <Hourglass size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">กรุณารอสักครู่</h3>
                    <p className="text-slate-500 mb-6 text-lg">
                        พนักงานกำลังตรวจสอบยอดชำระเงิน<br/>
                        ของโต๊ะ {selectedTable.name}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> กำลังดำเนินการ...
                    </div>
                </GlassCard>
            </div>
        )}

        {/* --- MODAL: Payment Success --- */}
        {isPaymentSuccess && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-6">
                <GlassCard className="p-8 w-full max-w-sm flex flex-col items-center !bg-white/95 text-center shadow-2xl scale-105 transition-transform">
                    <div className="bg-green-100 p-6 rounded-full text-green-600 mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">ชำระเงินสำเร็จ!</h3>
                    <p className="text-slate-500 mb-6">
                        ขอบคุณที่ใช้บริการ<br/>
                        โอกาสหน้าเชิญใหม่ครับ
                    </p>
                    <p className="text-xs text-slate-400">กำลังกลับสู่หน้าหลัก...</p>
                </GlassCard>
            </div>
        )}

      </div>
    </>
  );
}