'use client';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  Search, 
  ChevronDown, 
  Clock,
  DollarSign,
  Users,
  Phone,
  Loader2,
  CalendarDays,
  CalendarRange,
  Receipt,
  CheckCircle,
  Bell,
  ListChecks,
  X,
  Utensils,
  Edit,
  Trash2,
  Plus,
  Image,
  RotateCcw
} from 'lucide-react';
import { GlassCard, GlassButton } from '../../../components/ui/Glass';
import { useRestaurant, MenuItem } from '../../../context/RestaurantContext';
import { useNotification } from '../../../context/NotificationContext';
import Navbar from '../../../components/Navbar';
import DishImage from '../../../components/DishImage';

export default function AdminDashboard() {
  const { orders, reservations, isLoading, updateReservationStatus, confirmPayment, menuItems, addMenuItem, updateMenuItem, deleteMenuItem, resetDemoData } = useRestaurant();
  const { showConfirm, showAlert } = useNotification();
  const [filterTableDate, setFilterTableDate] = useState('today'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'bills' | 'menu'>('orders');
  
  const [selectedBillTableId, setSelectedBillTableId] = useState<number | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // --- Menu Management State ---
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({ name: '', category: '', price: '', image: '' });
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.category || !menuForm.price || !menuForm.image) return;
    setIsSavingMenu(true);
    try {
      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem.id, {
          name: menuForm.name,
          category: menuForm.category,
          price: Number(menuForm.price),
          image: menuForm.image
        });
      } else {
        await addMenuItem({
          name: menuForm.name,
          category: menuForm.category,
          price: Number(menuForm.price),
          image: menuForm.image
        });
      }
      setIsMenuModalOpen(false);
      setEditingMenuItem(null);
      setMenuForm({ name: '', category: '', price: '', image: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleDeleteMenu = async (id: string | number) => {
    showConfirm("คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?", async () => {
      await deleteMenuItem(id);
    });
  };

  const openEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      image: item.image
    });
    setIsMenuModalOpen(true);
  };

  const openAddMenu = () => {
    setEditingMenuItem(null);
    setMenuForm({ name: '', category: '', price: '', image: '' });
    setIsMenuModalOpen(true);
  };

  // --- 1. คำนวณยอดขาย ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const stats = orders.reduce((acc, order) => {
    if (!order || !order.timestamp) return acc;
    const orderDate = order.timestamp instanceof Date ? order.timestamp : new Date(order.timestamp);
    if (isNaN(orderDate.getTime())) return acc;

    // คำนวณยอดขายเฉพาะออเดอร์ที่จ่ายเงินแล้ว (paid) หรือเสิร์ฟแล้ว (เผื่อกรณียังไม่เคลียร์โต๊ะ)
    // แต่ถ้าต้องการแม่นยำเรื่องยอดรับจริง ควรนับเฉพาะ 'paid'
    const orderTotal = (order.items || []).reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

    if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        acc.monthRevenue += orderTotal;
        acc.monthOrders += 1;
        if (orderDate.getDate() === today.getDate()) {
            acc.dayRevenue += orderTotal;
            acc.dayOrders += 1;
        }
    }
    acc.totalRevenue += orderTotal;
    return acc;
  }, { dayRevenue: 0, dayOrders: 0, monthRevenue: 0, monthOrders: 0, totalRevenue: 0 });

  const popularItems = orders.flatMap(o => o.items || []).reduce((acc: Record<string, number>, item) => {
     const qty = item.qty || 1;
     acc[item.name] = (acc[item.name] || 0) + qty;
     return acc;
  }, {} as Record<string, number>);
  const topSellingItemEntry = Object.entries(popularItems).sort((a, b) => b[1] - a[1])[0];

  // --- 2. Filter Bill Requests ---
  const billRequests = orders.filter(o => o.status === 'bill_requested');
  const tablesRequestingBill = Array.from(new Set(billRequests.map(o => o.tableId))).sort((a, b) => a - b);

  // --- 3. Filter Table Data (แสดงทั้งหมด รวมถึงที่ Paid แล้ว) ---
  const tableOrders = orders.filter(order => {
    if (!order || !order.timestamp) return false;
    const orderDate = order.timestamp instanceof Date ? order.timestamp : new Date(order.timestamp);
    if (isNaN(orderDate.getTime())) return false;

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (order.id || '').toLowerCase().includes(searchLower) || 
               `โต๊ะ ${order.tableId}`.toLowerCase().includes(searchLower);
    }

    const isToday = orderDate.getDate() === today.getDate() &&
                    orderDate.getMonth() === today.getMonth() &&
                    orderDate.getFullYear() === today.getFullYear();
    
    if (filterTableDate === 'today' && !isToday) return false;
    
    return true;
  });

  const tableReservations = reservations.filter((res: any) => {
    if (!res || !res.date) return false;
    const resDate = new Date(res.date);
    
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (res.name || '').toLowerCase().includes(searchLower) || 
               (res.phone || '').includes(searchLower);
    }

    if (filterTableDate === 'today') {
        const isToday = resDate.getDate() === today.getDate() &&
                        resDate.getMonth() === today.getMonth() &&
                        resDate.getFullYear() === today.getFullYear();
        if (!isToday) return false;
    }

    return true;
  });

  const getReservationStatusColor = (status: string) => {
    switch(status) {
        case 'confirmed': return 'bg-green-500/20 text-green-700 border-green-500/30';
        case 'cancelled': return 'bg-red-500/20 text-red-700 border-red-500/30';
        case 'completed': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
        default: return 'bg-orange-500/20 text-orange-700 border-orange-500/30'; 
    }
  };

  const selectedTableBillOrders = selectedBillTableId 
    ? billRequests.filter(o => o.tableId === selectedBillTableId)
    : [];
  
  const billItemsAggregated = selectedTableBillOrders.flatMap(o => o.items).reduce((acc: MenuItem[], item) => {
      const existing = acc.find(i => i.id === item.id);
      if (existing) {
          existing.qty = (existing.qty || 0) + (item.qty || 1);
      } else {
          acc.push({ ...item, qty: item.qty || 1 });
      }
      return acc;
  }, []);

  const selectedTableBillTotal = billItemsAggregated.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

  const handleExecutePayment = async () => {
    if (selectedBillTableId === null) return;
    setIsConfirmingPayment(true);
    try {
        const orderIdsToPay = orders
            .filter(o => o.tableId === selectedBillTableId && o.status !== 'paid')
            .map(o => o.id);
        await confirmPayment(orderIdsToPay);
        setSelectedBillTableId(null); 
    } catch (error) {
        console.error(error);
    } finally {
        setIsConfirmingPayment(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-8 animate-fade-in min-h-screen relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3 text-stone-900">
              <LayoutDashboard className="text-amber-600" size={32} /> 
              Admin Dashboard
            </h2>
            <p className="text-stone-600 mt-1">สรุปยอดขายรายวันและรายเดือน (ระบบเดโมทดลองใช้งาน)</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                showConfirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นเดโมหรือไม่?', () => {
                  resetDemoData();
                  showAlert('รีเซ็ตข้อมูลเดโมเรียบร้อยแล้ว!', 'success');
                });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-sm font-medium transition active:scale-95 shadow-xs"
              title="รีเซ็ตเมนู ออเดอร์ และการจอง กลับสู่ค่าเริ่มต้นตัวอย่าง"
            >
              <RotateCcw size={16} />
              <span>รีเซ็ตข้อมูลเดโม</span>
            </button>
          </div>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 size={48} className="text-amber-600 animate-spin mb-4" />
                <p className="text-stone-600 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Stats Cards */}
                    <GlassCard className="p-6 flex items-center gap-4 bg-white border border-stone-200/80 shadow-xs relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <CalendarDays size={100} className="text-amber-600" />
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 shadow-xs z-10">
                            <DollarSign size={24} />
                        </div>
                        <div className="z-10">
                            <p className="text-stone-600 text-sm font-bold flex items-center gap-1.5">
                                ยอดขายวันนี้ <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Daily</span>
                            </p>
                            <h3 className="text-3xl font-black text-stone-900 mt-1">฿{stats.dayRevenue.toLocaleString()}</h3>
                            <p className="text-stone-500 text-xs mt-1">{stats.dayOrders} ออเดอร์</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex items-center gap-4 bg-white border border-stone-200/80 shadow-xs relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <CalendarRange size={100} className="text-orange-600" />
                        </div>
                        <div className="p-4 rounded-2xl bg-orange-50 text-orange-600 shadow-xs z-10">
                            <TrendingUp size={24} />
                        </div>
                        <div className="z-10">
                            <p className="text-stone-600 text-sm font-bold flex items-center gap-1.5">
                                ยอดขายเดือนนี้ <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">Monthly</span>
                            </p>
                            <h3 className="text-3xl font-black text-stone-900 mt-1">฿{stats.monthRevenue.toLocaleString()}</h3>
                            <p className="text-stone-500 text-xs mt-1">{stats.monthOrders} ออเดอร์</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex items-center gap-4 bg-white border border-stone-200/80 shadow-xs relative overflow-hidden">
                        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs z-10">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="z-10 w-full">
                            <p className="text-stone-600 text-sm font-bold">เมนูยอดฮิต</p>
                            <h3 className="text-xl font-black text-stone-900 truncate w-full mt-1">
                                {topSellingItemEntry ? topSellingItemEntry[0] : '-'}
                            </h3>
                            {topSellingItemEntry && <p className="text-stone-500 text-xs mt-1">ขายไปแล้ว {topSellingItemEntry[1]} จาน</p>}
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shadow-xs w-full md:w-auto overflow-x-auto">
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'orders' 
                                    ? 'bg-white text-stone-900 shadow-xs' 
                                    : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                <span className="flex items-center gap-2"><Clock size={16} /> ประวัติออเดอร์</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('reservations')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'reservations' 
                                    ? 'bg-white text-stone-900 shadow-xs' 
                                    : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                <span className="flex items-center gap-2"><Calendar size={16} /> รายการจอง</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('bills')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                                    activeTab === 'bills' 
                                    ? 'bg-white text-stone-900 shadow-xs' 
                                    : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Receipt size={16} /> 
                                    แจ้งเตือนบิล
                                    {tablesRequestingBill.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                                            {tablesRequestingBill.length}
                                        </span>
                                    )}
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('menu')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'menu' 
                                    ? 'bg-white text-stone-900 shadow-xs' 
                                    : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                <span className="flex items-center gap-2"><Utensils size={16} /> จัดการเมนู</span>
                            </button>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {(activeTab === 'orders' || activeTab === 'reservations') && (
                                <div className="relative">
                                    <select 
                                        value={filterTableDate}
                                        onChange={(e) => setFilterTableDate(e.target.value)}
                                        className="appearance-none bg-white text-stone-800 border border-stone-200 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none hover:border-amber-500 transition cursor-pointer text-sm font-medium shadow-xs"
                                    >
                                        <option value="today">รายการวันนี้</option>
                                        <option value="all">รายการทั้งหมด</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                                </div>
                            )}

                            <div className="relative flex-1 md:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input 
                                    type="text" 
                                    placeholder={activeTab === 'orders' ? "ค้นหา Order ID..." : activeTab === 'bills' ? "ค้นหาโต๊ะ..." : "ค้นหาชื่อเมนู/หมวดหมู่..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition text-sm shadow-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <GlassCard className="overflow-hidden bg-white border border-stone-200/80 shadow-xs rounded-2xl">
                        {/* --- TAB 1: BILLS --- */}
                        {activeTab === 'bills' && (
                            <div>
                                <div className="p-5 border-b border-stone-200/80 flex justify-between items-center bg-stone-50/40">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                            <Receipt size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 text-base">แจ้งเตือนเช็คบิล</h3>
                                            <p className="text-xs text-stone-500">โต๊ะที่กดเรียกพนักงานเพื่อชำระเงิน</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                                        {tablesRequestingBill.length} โต๊ะรอเช็คบิล
                                    </span>
                                </div>
                                <div className="p-6">
                                    {tablesRequestingBill.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                                            <Bell size={48} className="mb-3 opacity-30 text-stone-300" />
                                            <p className="font-medium text-stone-500">ไม่มีรายการเรียกเก็บเงินในขณะนี้</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {tablesRequestingBill.map(tableId => {
                                                const thisTableOrders = billRequests.filter(o => o.tableId === tableId);
                                                const billTotal = thisTableOrders.reduce((total, order) => {
                                                    return total + order.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
                                                }, 0);

                                                return (
                                                    <div key={tableId} className="border border-red-200/80 bg-red-50/40 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h3 className="text-xl font-bold text-stone-900">โต๊ะ {tableId}</h3>
                                                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 animate-pulse">
                                                                    เรียกเช็คบิล
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1 mb-4">
                                                                <p className="text-xs text-stone-500">จำนวน: {thisTableOrders.length} ออเดอร์</p>
                                                                <p className="text-2xl font-black text-stone-900">฿{billTotal.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <GlassButton 
                                                            onClick={() => setSelectedBillTableId(tableId)}
                                                            className="w-full !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !border-0 shadow-sm hover:shadow-md"
                                                        >
                                                            <CheckCircle size={18} className="mr-2" /> ตรวจสอบ / รับเงิน
                                                        </GlassButton>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- TAB 2: ORDERS --- */}
                        {activeTab === 'orders' && (
                            <div>
                                <div className="p-5 border-b border-stone-200/80 flex justify-between items-center bg-stone-50/40">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 text-base">ประวัติการสั่งอาหาร</h3>
                                            <p className="text-xs text-stone-500">รายการสั่งอาหารทั้งหมดที่บันทึกในระบบ</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
                                        {tableOrders.length} รายการ
                                    </span>
                                </div>
                                <div className="overflow-x-auto min-h-[300px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                                <th className="py-3.5 px-6 w-28">Order ID</th>
                                                <th className="py-3.5 px-6 w-44">เวลา</th>
                                                <th className="py-3.5 px-6 w-28">โต๊ะ</th>
                                                <th className="py-3.5 px-6">รายการอาหาร</th>
                                                <th className="py-3.5 px-6 w-36 text-right">ยอดรวม</th>
                                                <th className="py-3.5 px-6 w-36 text-center">สถานะ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {tableOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-stone-400">
                                                        ไม่พบข้อมูลการสั่งซื้อ
                                                    </td>
                                                </tr>
                                            ) : (
                                                tableOrders.sort((a,b) => {
                                                    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
                                                    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
                                                    return dateB.getTime() - dateA.getTime();
                                                }).map((order, index) => {
                                                    const orderTotal = (order.items || []).reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
                                                    const orderDate = order.timestamp instanceof Date ? order.timestamp : new Date(order.timestamp);
                                                    const orderNumber = tableOrders.length - index;
                                                    
                                                    return (
                                                        <tr key={order.id} className="hover:bg-stone-50/60 transition">
                                                            <td className="py-4 px-6 text-sm font-bold text-stone-900">#{orderNumber}</td>
                                                            <td className="py-4 px-6 text-sm text-stone-700">
                                                                {orderDate.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                                                                <span className="block text-xs text-stone-400">
                                                                    {orderDate.toLocaleDateString('th-TH')}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6 font-medium text-stone-800">โต๊ะ {order.tableId}</td>
                                                            <td className="py-4 px-6 text-sm text-stone-600">
                                                                <div className="line-clamp-2">
                                                                    {(order.items || []).map(i => `${i.name} x${i.qty}`).join(', ')}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6 text-sm font-bold text-stone-900 text-right">฿{orderTotal.toLocaleString()}</td>
                                                            <td className="py-4 px-6 text-center">
                                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                                                                    order.status === 'served' 
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
                                                                    : order.status === 'cooking' 
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-200/70' 
                                                                    : order.status === 'bill_requested'
                                                                    ? 'bg-rose-50 text-rose-700 border-rose-200/70'
                                                                    : order.status === 'paid'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200/70' 
                                                                    : 'bg-stone-100 text-stone-700 border-stone-200'
                                                                }`}>
                                                                    {order.status === 'served' ? 'เสิร์ฟแล้ว' : order.status === 'cooking' ? 'กำลังปรุง' : order.status === 'bill_requested' ? 'รอเช็คบิล' : order.status === 'paid' ? 'ชำระเงินแล้ว' : 'รอคิว'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 3: RESERVATIONS --- */}
                        {activeTab === 'reservations' && (
                            <div>
                                <div className="p-5 border-b border-stone-200/80 flex justify-between items-center bg-stone-50/40">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 text-base">รายการจองโต๊ะ</h3>
                                            <p className="text-xs text-stone-500">ข้อมูลการจองโต๊ะล่วงหน้าของลูกค้า</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
                                        {tableReservations.length} รายการ
                                    </span>
                                </div>
                                <div className="overflow-x-auto min-h-[300px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                                <th className="py-3.5 px-6">ชื่อผู้จอง</th>
                                                <th className="py-3.5 px-6 w-44">เบอร์โทร</th>
                                                <th className="py-3.5 px-6 w-48">วันที่</th>
                                                <th className="py-3.5 px-6 w-32">เวลา</th>
                                                <th className="py-3.5 px-6 w-36">จำนวนคน</th>
                                                <th className="py-3.5 px-6 w-40 text-center">สถานะ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {tableReservations.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-stone-400">
                                                        ไม่พบข้อมูลการจอง
                                                    </td>
                                                </tr>
                                            ) : (
                                                tableReservations.sort((a: any, b: any) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()).map((res: any) => (
                                                    <tr key={res.id} className="hover:bg-stone-50/60 transition group">
                                                        <td className="py-4 px-6 font-bold text-stone-800">{res.name}</td>
                                                        <td className="py-4 px-6 text-sm text-stone-600">
                                                            <div className="flex items-center gap-2">
                                                                <Phone size={14} className="text-stone-400" />
                                                                {res.phone}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-stone-600">
                                                            {new Date(res.date).toLocaleDateString('th-TH', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm font-medium text-stone-800">
                                                            <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200/70 font-bold text-xs">
                                                                {res.time} น.
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-stone-600">
                                                            <div className="flex items-center gap-2">
                                                                <Users size={16} className="text-stone-400" />
                                                                {res.guests} ท่าน
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <div className="relative inline-block rounded-full transition-all">
                                                                <select
                                                                    value={res.status || 'pending'}
                                                                    onChange={(e) => updateReservationStatus(res.id, e.target.value)}
                                                                    className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${getReservationStatusColor(res.status || 'pending')}`}
                                                                >
                                                                    <option value="pending" className="bg-white text-stone-800">รอการยืนยัน</option>
                                                                    <option value="confirmed" className="bg-white text-green-700">ยืนยันแล้ว</option>
                                                                    <option value="cancelled" className="bg-white text-red-700">ยกเลิก</option>
                                                                    <option value="completed" className="bg-white text-blue-700">เสร็จสิ้น</option>
                                                                </select>
                                                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 4: MENU --- */}
                        {activeTab === 'menu' && (
                            <div>
                                <div className="p-5 border-b border-stone-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-stone-50/40">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                            <Utensils size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 text-base">จัดการรายการอาหาร</h3>
                                            <p className="text-xs text-stone-500">จัดการข้อมูล ชื่อเมนู หมวดหมู่ ราคา และรูปภาพ</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
                                            {menuItems.length} รายการ
                                        </span>
                                        <button 
                                            disabled
                                            className="flex items-center gap-2 py-2 px-4 bg-stone-100 text-stone-400 rounded-xl text-sm font-bold border border-stone-200 cursor-not-allowed opacity-60 select-none shrink-0"
                                            title="ปิดการใช้งานฟังก์ชันเพิ่มเมนูในเวอร์ชันเดโม"
                                        >
                                            <Plus size={16} />
                                            เพิ่มเมนูอาหาร
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto min-h-[300px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                                <th className="py-3.5 px-6 w-24">รูปภาพ</th>
                                                <th className="py-3.5 px-6">ชื่อเมนู</th>
                                                <th className="py-3.5 px-6 w-48">หมวดหมู่</th>
                                                <th className="py-3.5 px-6 w-36 text-right">ราคา</th>
                                                <th className="py-3.5 px-6 w-32 text-center">จัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {menuItems.filter(item => {
                                                if (!searchTerm) return true;
                                                const searchLower = searchTerm.toLowerCase();
                                                return (item.name || '').toLowerCase().includes(searchLower) || 
                                                       (item.category || '').toLowerCase().includes(searchLower);
                                            }).length === 0 ? (
                                                <tr><td colSpan={5} className="py-12 text-center text-stone-400">ยังไม่มีรายการเมนูที่ตรงกับการค้นหา</td></tr>
                                            ) : (
                                                menuItems.filter(item => {
                                                    if (!searchTerm) return true;
                                                    const searchLower = searchTerm.toLowerCase();
                                                    return (item.name || '').toLowerCase().includes(searchLower) || 
                                                           (item.category || '').toLowerCase().includes(searchLower);
                                                }).map((item) => (
                                                    <tr key={item.id} className="hover:bg-stone-50/60 transition">
                                                        <td className="py-3.5 px-6">
                                                            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs border border-stone-200 bg-stone-100">
                                                                <DishImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6 font-bold text-stone-900 text-base">{item.name}</td>
                                                        <td className="py-3.5 px-6 text-sm">
                                                            <span className="inline-flex items-center bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-semibold border border-stone-200/60">
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-6 text-right font-black text-amber-700 text-base">฿{item.price}</td>
                                                        <td className="py-3.5 px-6 text-center">
                                                            <div className="flex justify-center items-center gap-1.5">
                                                                <button 
                                                                    disabled 
                                                                    className="p-2 text-stone-300 bg-stone-50 rounded-xl border border-stone-200/50 cursor-not-allowed select-none" 
                                                                    title="ปิดการใช้งานการแก้ไขเมนูในเวอร์ชันเดโม"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button 
                                                                    disabled 
                                                                    className="p-2 text-stone-300 bg-stone-50 rounded-xl border border-stone-200/50 cursor-not-allowed select-none" 
                                                                    title="ปิดการใช้งานการลบเมนูในเวอร์ชันเดโม"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </>
        )}

        {/* --- MODAL: Bill Review for Admin --- */}
        {selectedBillTableId !== null && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-6">
                <GlassCard className="p-6 w-full max-w-md flex flex-col !bg-white/95 shadow-2xl max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                <ListChecks size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">สรุปบิล โต๊ะ {selectedBillTableId}</h3>
                        </div>
                        <button onClick={() => setSelectedBillTableId(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2 scrollbar-thin">
                        {billItemsAggregated.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="bg-emerald-100 text-emerald-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-xs shadow-sm">{item.qty}x</span>
                                    <div className="flex flex-col">
                                        <span className="text-slate-800 font-medium">{item.name}</span>
                                        <span className="text-slate-400 text-xs">฿{item.price} / หน่วย</span>
                                    </div>
                                </div>
                                <span className="text-slate-700 font-bold">฿{(item.price * (item.qty || 1)).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4 text-white mb-6 shadow-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">ยอดรวมทั้งสิ้น</span>
                            <span className="font-bold text-2xl text-emerald-400">฿{selectedTableBillTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSelectedBillTableId(null)}
                            className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition border border-slate-200"
                        >
                            ปิดหน้าต่าง
                        </button>
                        <GlassButton 
                            onClick={handleExecutePayment} 
                            active 
                            disabled={isConfirmingPayment}
                            className="flex-[1.5] py-3 shadow-lg !bg-gradient-to-r !from-emerald-500 !to-teal-500 border-0"
                        >
                            <span className="flex items-center justify-center gap-2">
                                  {isConfirmingPayment ? <Loader2 size={20} className="animate-spin inline mr-2" /> : <CheckCircle size={20} className="inline mr-2" />}
                            ยืนยันรับชำระเงิน</span>
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        )}

        {/* --- MODAL: Menu Management --- */}
        {isMenuModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-6">
                <GlassCard className="p-6 w-full max-w-md flex flex-col !bg-white/95 shadow-2xl">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                                {editingMenuItem ? <Edit size={24} /> : <Plus size={24} />}
                            </div>
                            <h3 className="text-xl font-bold text-stone-900">{editingMenuItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h3>
                        </div>
                        <button onClick={() => setIsMenuModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveMenu} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">ชื่อเมนู</label>
                            <input 
                                type="text" 
                                required
                                value={menuForm.name}
                                onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                                className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                placeholder="เช่น ต้มยำกุ้ง"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">หมวดหมู่</label>
                            <input 
                                type="text" 
                                required
                                value={menuForm.category}
                                onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                                className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                placeholder="เช่น ต้ม/แกง, อาหารจานเดียว"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">ราคา (บาท)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                value={menuForm.price}
                                onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                                className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                placeholder="เช่น 150"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">รูปภาพอาหาร (ไฟล์ใน /images/dishes/... หรือ URL หรือ Emoji)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    required
                                    value={menuForm.image}
                                    onChange={(e) => setMenuForm({...menuForm, image: e.target.value})}
                                    className="flex-1 px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-sm"
                                    placeholder="เช่น /images/dishes/tomyum.jpg"
                                />
                                {menuForm.image && (
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-50">
                                        <DishImage src={menuForm.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {[
                                    { label: 'ต้มยำ', path: '/images/dishes/tomyum.jpg' },
                                    { label: 'ผัดไทย', path: '/images/dishes/padthai.jpg' },
                                    { label: 'ส้มตำ', path: '/images/dishes/somtum.jpg' },
                                    { label: 'ไก่ย่าง', path: '/images/dishes/gaiyang.jpg' },
                                    { label: 'ข้าวผัดปู', path: '/images/dishes/khaopadpu.jpg' },
                                    { label: 'ปลากะพง', path: '/images/dishes/seabass.jpg' },
                                    { label: 'แกงเขียวหวาน', path: '/images/dishes/greencurry.jpg' },
                                    { label: 'คอหมูย่าง', path: '/images/dishes/mooyang.jpg' },
                                    { label: 'ข้าวเหนียวมะม่วง', path: '/images/dishes/mangorice.jpg' },
                                    { label: 'ชาไทย', path: '/images/dishes/thaitea.jpg' },
                                    { label: 'แตงโมปั่น', path: '/images/dishes/watermelon.jpg' },
                                    { label: 'มะนาวโซดา', path: '/images/dishes/limesoda.jpg' },
                                ].map(preset => (
                                    <button
                                        key={preset.path}
                                        type="button"
                                        onClick={() => setMenuForm({...menuForm, image: preset.path})}
                                        className="text-[11px] bg-stone-100 hover:bg-amber-50 hover:text-amber-700 px-2 py-1 rounded-lg border border-stone-200 transition active:scale-95 text-stone-700"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-stone-100">
                            <button 
                                type="button"
                                onClick={() => setIsMenuModalOpen(false)}
                                className="flex-1 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition border border-stone-200"
                            >
                                ยกเลิก
                            </button>
                            <GlassButton 
                                type="submit"
                                active 
                                disabled={isSavingMenu}
                                className="flex-[1.5] py-3 shadow-lg !bg-gradient-to-r !from-amber-500 !to-orange-600 border-0 flex justify-center"
                            >
                                {isSavingMenu ? <Loader2 size={20} className="animate-spin" /> : 'บันทึกข้อมูล'}
                            </GlassButton>
                        </div>
                    </form>
                </GlassCard>
            </div>
        )}
      </div>
    </>
  );
}