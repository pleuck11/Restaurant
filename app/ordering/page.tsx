'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Receipt, Minus, Plus, Search, History, Clock, Loader2, CheckCircle, Hourglass, ListChecks, X, ChevronUp, XCircle } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { useRestaurant } from '@/context/RestaurantContext';
import { useNotification } from '@/context/NotificationContext';
import Navbar from '@/components/Navbar';
import DishImage from '@/components/DishImage';

export default function OrderingPage() {
  const router = useRouter();
  const { cart, selectedTable, addToCart, updateQty, placeOrder, orders, checkBill, menuItems } = useRestaurant();
  const { showAlert, showConfirm } = useNotification();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [sidebarTab, setSidebarTab] = useState<'cart' | 'bill'>('cart');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Bill Process
  const [isWaitingForBill, setIsWaitingForBill] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  
  // State for Order Confirmation
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);

  // Mobile bottom sheet state
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // ถ้าไม่ได้เลือกโต๊ะ ให้เด้งกลับไปหน้า Scan
  useEffect(() => {
    if (!selectedTable) {
      router.push('/scan');
    }
  }, [selectedTable, router]);

  // Check if bill has been requested
  const tableOrders = orders.filter(o => o.tableId === selectedTable?.id);
  const activeOrders = tableOrders.filter(o => o.status !== 'paid');
  const hasBillRequested = activeOrders.some(o => o.status === 'bill_requested');
  const hasUnservedOrders = activeOrders.some(o => o.status === 'pending' || o.status === 'cooking');

  // Monitor Payment Success
  useEffect(() => {
    if (isWaitingForBill && activeOrders.length === 0) {
        setIsWaitingForBill(false);
        setIsPaymentSuccess(true);
        setTimeout(() => {
            router.push('/');
        }, 3000);
    }
  }, [tableOrders, isWaitingForBill, router]);

  useEffect(() => {
    if (hasBillRequested) {
        setIsWaitingForBill(true);
    }
  }, [hasBillRequested]);

  if (!selectedTable) return null;

  const categories = ['ทั้งหมด', ...new Set(menuItems.map(i => i.category))];
  const filteredMenu = menuItems.filter(item => {
    const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 0)), 0);
  const cartCount = cart.reduce((s, i) => s + (i.qty || 0), 0);
  
  const billTotal = activeOrders.reduce((total, order) => {
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
    setIsMobileSheetOpen(false);
    showAlert('ส่งรายการอาหารเข้าครัวเรียบร้อยแล้ว!', 'success');
  };

  const handleCheckBill = async () => {
    showConfirm(`ยืนยันการเช็คบิลโต๊ะ ${selectedTable.name}?`, async () => {
        await checkBill();
        setIsWaitingForBill(true);
    });
  };

  return (
    <>
      <Navbar />

      {/* =================== MOBILE & TABLET LAYOUT (<1024px) =================== */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-56px)] animate-fade-in relative max-w-3xl mx-auto w-full">
        
        {/* Mobile Header */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-bold text-stone-900">เมนูอาหาร</h2>
              <span className="text-stone-500 text-xs font-medium">สั่งให้: {selectedTable.name}</span>
            </div>
          </div>
          {/* Mobile Search Bar */}
          <div className="relative mt-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="ค้นหาเมนู..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 bg-white border border-stone-200 rounded-2xl text-stone-800 placeholder-stone-400 outline-none focus:border-amber-500 shadow-xs transition-all text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 active:scale-90">
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Category Bar - Sticky */}
        <div className="px-4 pb-2 shrink-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs' 
                  : 'bg-white text-stone-600 border border-stone-200/80 shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Menu Items - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <div key={item.id} className="bg-white border border-stone-200/80 rounded-2xl p-3 flex gap-3 shadow-xs active:bg-stone-50 transition-all">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-inner border border-stone-200 shrink-0 relative bg-stone-100">
                    <DishImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {item.spicyLevel && item.spicyLevel > 0 ? (
                      <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-[9px] px-1 py-0.2 rounded text-white">
                        {'🌶️'.repeat(Math.min(item.spicyLevel, 3))}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-stone-900 text-sm leading-tight">{item.name}</h3>
                        {item.isPopular && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">
                            แนะนำ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">{item.category}</span>
                      {item.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <span className="font-extrabold text-amber-700 text-base">฿{item.price}</span>
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-0.5 shadow-inner border border-stone-200">
                          <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-stone-600 active:scale-90 shadow-xs">
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center font-bold text-sm text-stone-800">{inCart.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-r from-amber-500 to-orange-600 text-white active:scale-90 shadow-xs">
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { addToCart(item); }}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-xl shadow-xs active:scale-90 transition-all flex items-center gap-1 text-xs font-bold"
                        >
                          <Plus size={14} />
                          <span>สั่ง</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet FAB / Cart Summary Bar */}
        {(cartCount > 0 || activeOrders.length > 0) && !isMobileSheetOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe animate-slide-up" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setIsMobileSheetOpen(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-4 shadow-lg shadow-orange-500/25 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-xl p-2">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{cartCount} รายการ</p>
                    <p className="text-white/80 text-xs">แตะเพื่อดูตะกร้า</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">฿{cartTotal}</span>
                  <ChevronUp size={18} className="text-white/70" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Mobile/Tablet Bottom Sheet */}
        {isMobileSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileSheetOpen(false)} />
            
            {/* Sheet */}
            <div className="relative w-full sm:max-w-lg sm:mx-auto bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Sheet Tabs */}
              <div className="flex border-b border-slate-100 px-4 gap-2 pb-2">
                <button 
                  onClick={() => setSidebarTab('cart')}
                  className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${sidebarTab === 'cart' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <ShoppingBag size={16} /> ตะกร้า ({cartCount})
                </button>
                <button 
                  onClick={() => setSidebarTab('bill')}
                  className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${sidebarTab === 'bill' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <Receipt size={16} /> บิล (฿{billTotal})
                </button>
              </div>

              {/* Sheet Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {sidebarTab === 'cart' ? (
                  <>
                    {cart.length === 0 ? (
                      <div className="text-center text-slate-300 py-10 flex flex-col items-center">
                        <ShoppingBag size={40} className="opacity-50 mb-2" />
                        <p className="font-medium text-sm">ตะกร้าว่างเปล่า</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                              <div className="text-xs text-slate-400">฿{item.price}</div>
                            </div>
                            <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 shadow-inner border border-slate-100">
                              <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-600 active:scale-90 shadow-sm">
                                <Minus size={14} />
                              </button>
                              <span className="w-5 text-center font-bold text-sm text-slate-700">{item.qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-r from-orange-400 to-pink-500 text-white active:scale-90 shadow-sm">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {activeOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <History size={40} className="mb-2 text-slate-300" />
                        <p className="text-slate-400 font-medium text-sm">ยังไม่มีประวัติ</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeOrders.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(order => (
                          <div key={order.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={10} /> {new Date(order.timestamp).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                order.status === 'served' ? 'bg-green-50 text-green-600 border-green-200' : 
                                order.status === 'cooking' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                                order.status === 'bill_requested' ? 'bg-red-50 text-red-600 border-red-200' :
                                'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {order.status === 'served' ? 'เสิร์ฟแล้ว' : order.status === 'cooking' ? 'กำลังทำ' : order.status === 'bill_requested' ? 'เรียกบิลแล้ว' : 'รอคิว'}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {order.items.map((item, iIdx) => (
                                <div key={`${order.id}-${iIdx}`} className="flex justify-between text-sm">
                                  <span className="text-slate-600">{item.name} <span className="text-slate-300 text-xs">x{item.qty}</span></span>
                                  <span className="font-bold text-slate-500 text-xs">฿{item.price * (item.qty || 0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <div className="bg-slate-800 p-4 rounded-xl text-white shadow-lg">
                          <div className="flex justify-between text-sm text-slate-300 mb-1">
                            <span>ยอดรวม</span>
                            <span>฿{billTotal}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold">
                            <span>สุทธิ</span>
                            <span className="text-orange-400">฿{billTotal}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sheet Footer */}
              <div className="p-4 border-t border-slate-100 bg-white" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
                {sidebarTab === 'cart' ? (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-slate-600 text-sm">{cartCount} รายการ</span>
                      <span className="font-bold text-pink-600 text-lg">฿{cartTotal}</span>
                    </div>
                    <button 
                      onClick={handlePlaceOrderClick} 
                      disabled={cart.length === 0} 
                      className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.98] ${
                        cart.length > 0
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-500/30'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      ยืนยันสั่งอาหาร
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleCheckBill}
                    disabled={billTotal === 0 || hasBillRequested || hasUnservedOrders}
                    className={`w-full py-3.5 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                      hasBillRequested || hasUnservedOrders || billTotal === 0
                      ? 'bg-gray-300 text-white cursor-not-allowed' 
                      : 'bg-slate-800 text-white active:bg-slate-900 active:scale-[0.98]'
                    }`}
                  >
                    {hasBillRequested ? 'รอการตรวจสอบ...' : hasUnservedOrders ? 'รออาหารเสิร์ฟครบ' : <><Receipt size={18} /> เช็คบิล / ชำระเงิน</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================== DESKTOP LAYOUT (>=1024px) =================== */}
      <div className="hidden lg:flex h-[calc(100vh-80px)] flex-row gap-5 p-4 lg:p-6 animate-fade-in relative max-w-[1680px] mx-auto w-full">
        
        {/* --- MENU --- */}
        <div className="flex-1 overflow-y-auto pb-0 pr-2 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
          <div className="flex flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-black text-stone-900">เมนูอาหาร</h2>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full mt-2">
                <span className="text-sm text-amber-900 font-medium">สั่งให้: <strong className="font-bold">{selectedTable.name}</strong></span>
              </div>
            </div>
            <div className="p-2 flex items-center rounded-full bg-white border border-stone-200 px-4 w-auto shadow-xs">
               <Search size={20} className="text-stone-400 mr-2" />
               <input type="text" placeholder="ค้นหาเมนู..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-stone-900 placeholder-stone-400 w-full text-sm" />
               {searchTerm && <button onClick={() => setSearchTerm('')} className="text-stone-400 hover:text-stone-600 ml-2"><XCircle size={18} /></button>}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 shadow-xs ${
                  selectedCategory === cat 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-500/20 shadow-md' 
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <div 
                  key={item.id} 
                  className="p-3.5 flex flex-col hover:scale-[1.01] transition-all duration-300 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md group"
                >
                  {/* Dish Image on Top */}
                  <div className="w-full h-36 md:h-40 rounded-xl overflow-hidden shadow-inner border border-stone-200 shrink-0 relative bg-stone-100 mb-3">
                    <DishImage src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {item.isPopular && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        แนะนำ
                      </span>
                    )}
                    {item.spicyLevel && item.spicyLevel > 0 ? (
                      <span className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-sm text-[11px] px-2 py-0.5 rounded-md text-white">
                        {'🌶️'.repeat(Math.min(item.spicyLevel, 3))}
                      </span>
                    ) : null}
                  </div>

                  {/* Dish Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-stone-900 text-base leading-tight line-clamp-1">{item.name}</h3>
                      </div>
                      {item.nameEn && (
                        <span className="text-[11px] text-stone-400 block leading-tight truncate mt-0.5">{item.nameEn}</span>
                      )}
                      <span className="inline-block text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md mt-1.5 border border-stone-200 font-medium">
                        {item.category}
                      </span>
                      {item.description && (
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-snug">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Action Button */}
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-100">
                      <span className="font-extrabold text-amber-700 text-lg tracking-tight">฿{item.price}</span>
                      
                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1 shadow-inner border border-stone-200">
                          <button 
                            onClick={() => updateQty(item.id, -1)} 
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-600 active:scale-90 hover:bg-stone-50 shadow-xs transition cursor-pointer"
                            title="ลดจำนวน"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center font-bold text-sm text-stone-800">{inCart.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)} 
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white active:scale-90 shadow-xs hover:opacity-90 transition cursor-pointer"
                            title="เพิ่มจำนวน"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { addToCart(item); setSidebarTab('cart'); }}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                        >
                          <Plus size={15} />
                          <span>สั่ง</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- DESKTOP SIDEBAR --- */}
        <div className="relative w-80 xl:w-96 shrink-0 bg-white border border-stone-200/80 shadow-xs flex flex-col transition-all duration-500 z-40 rounded-2xl">
          <div className="flex border-b border-stone-100 p-2 gap-2">
            <button 
                onClick={() => setSidebarTab('cart')}
                className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${sidebarTab === 'cart' ? 'bg-amber-50 text-amber-900 border border-amber-200/60 shadow-xs' : 'text-stone-500 hover:bg-stone-50'}`}
            >
                <ShoppingBag size={18} /> ตะกร้า ({cartCount})
            </button>
            <button 
                onClick={() => setSidebarTab('bill')}
                className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${sidebarTab === 'bill' ? 'bg-stone-100 text-stone-900 border border-stone-200/60 shadow-xs' : 'text-stone-500 hover:bg-stone-50'}`}
            >
                <Receipt size={18} /> บิล (฿{billTotal})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-stone-200">
            {sidebarTab === 'cart' ? (
                <>
                    {cart.length === 0 ? (
                    <div className="text-center text-stone-400 py-10 flex flex-col items-center">
                        <ShoppingBag size={40} className="opacity-40 mb-2" />
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
                     {activeOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <History size={48} className="mb-2 text-slate-400" />
                    <p className="text-slate-500 font-medium text-sm">ยังไม่มีประวัติการสั่งอาหาร</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeOrders.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(order => (
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

          <div className="p-4 border-t border-stone-100 bg-stone-50/60 rounded-b-2xl">
            {sidebarTab === 'cart' ? (
                <>
                    <div className="flex justify-between items-center mb-4 text-base font-bold text-stone-900">
                        <span className="text-stone-600">ยอดรวม ({cartCount} จาน)</span>
                        <span className="text-amber-700 text-xl font-black">฿{cartTotal}</span>
                    </div>
                    <GlassButton onClick={handlePlaceOrderClick} disabled={cart.length === 0} active={cart.length > 0} className="w-full py-3.5 text-base font-bold shadow-xs">
                        ยืนยันสั่งอาหาร
                    </GlassButton>
                </>
            ) : (
                <button 
                    onClick={handleCheckBill}
                    disabled={billTotal === 0 || hasBillRequested || hasUnservedOrders}
                    className={`w-full py-3.5 rounded-xl font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        hasBillRequested || hasUnservedOrders || billTotal === 0
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                >
                    {hasBillRequested ? 'รอการตรวจสอบ...' : hasUnservedOrders ? 'รออาหารเสิร์ฟครบ' : <><Receipt size={20} /> เช็คบิล / ชำระเงิน</>}
                </button>
            )}
          </div>
        </div>
      </div>

      {/* =================== SHARED MODALS =================== */}

      {/* --- MODAL: Confirm Order Items --- */}
      {isConfirmingOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 md:p-6">
              <GlassCard className="p-5 md:p-6 w-full max-w-md flex flex-col !bg-white/95 shadow-2xl max-h-[80vh] rounded-3xl md:rounded-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                          <ListChecks size={22} />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-800">ทบทวนรายการอาหาร</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2.5 pr-1">
                      {cart.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-3">
                                  <span className="bg-orange-100 text-orange-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-xs shadow-sm">{item.qty}x</span>
                                  <div className="flex flex-col">
                                      <span className="text-slate-800 font-medium text-sm">{item.name}</span>
                                      <span className="text-slate-400 text-xs">{item.category}</span>
                                  </div>
                              </div>
                              <span className="text-slate-600 font-bold text-sm">฿{(item.price * (item.qty || 1)).toLocaleString()}</span>
                          </div>
                      ))}
                  </div>

                  <div className="bg-slate-800 rounded-xl p-4 text-white mb-4 shadow-lg">
                      <div className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm">ยอดรวมทั้งสิ้น</span>
                          <span className="font-bold text-xl text-orange-400">฿{cartTotal.toLocaleString()}</span>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setIsConfirmingOrder(false)}
                          className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 active:bg-slate-200 rounded-xl transition border border-slate-200"
                      >
                          แก้ไข
                      </button>
                      <button 
                          onClick={handleConfirmOrder} 
                          className="flex-[1.5] py-3 shadow-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl active:scale-[0.98] transition-all"
                      >
                          ยืนยันสั่งเลย
                      </button>
                  </div>
              </GlassCard>
          </div>
      )}

      {/* --- MODAL: Waiting for Payment --- */}
      {isWaitingForBill && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-6">
              <GlassCard className="p-8 w-full max-w-sm flex flex-col items-center !bg-white/95 text-center shadow-2xl rounded-3xl">
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
              <GlassCard className="p-8 w-full max-w-sm flex flex-col items-center !bg-white/95 text-center shadow-2xl scale-105 transition-transform rounded-3xl">
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
    </>
  );
}