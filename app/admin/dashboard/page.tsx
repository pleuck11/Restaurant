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
  X
} from 'lucide-react';
import { GlassCard, GlassButton } from '../../../components/ui/Glass';
import { useRestaurant, MenuItem } from '../../../context/RestaurantContext';
import Navbar from '../../../components/Navbar';

export default function AdminDashboard() {
  const { orders, reservations, isLoading, updateReservationStatus, confirmPayment } = useRestaurant();
  const [filterTableDate, setFilterTableDate] = useState('today'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'bills'>('orders');
  
  const [selectedBillTableId, setSelectedBillTableId] = useState<number | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

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

    const isToday = orderDate.getDate() === today.getDate() &&
                    orderDate.getMonth() === today.getMonth() &&
                    orderDate.getFullYear() === today.getFullYear();
    
    if (filterTableDate === 'today' && !isToday) return false;
    
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (order.id || '').toLowerCase().includes(searchLower) || 
               `โต๊ะ ${order.tableId}`.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const tableReservations = reservations.filter((res: any) => {
    if (!res || !res.date) return false;
    const resDate = new Date(res.date);
    
    if (filterTableDate === 'today') {
        const isToday = resDate.getDate() === today.getDate() &&
                        resDate.getMonth() === today.getMonth() &&
                        resDate.getFullYear() === today.getFullYear();
        if (!isToday) return false;
    }

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (res.name || '').toLowerCase().includes(searchLower) || 
               (res.phone || '').includes(searchLower);
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
        await confirmPayment(selectedBillTableId);
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
      <div className="p-4 md:p-8 animate-fade-in min-h-screen relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white drop-shadow-md">
              <LayoutDashboard className="text-white" size={32} /> 
              Admin Dashboard
            </h2>
            <p className="text-white/70 mt-1">สรุปยอดขายรายวันและรายเดือน</p>
          </div>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 size={48} className="text-white animate-spin mb-4" />
                <p className="text-white/70 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Stats Cards (Same as before) */}
                    <GlassCard className="p-6 flex items-center gap-4 !bg-gradient-to-br !from-emerald-500/20 !to-teal-500/20 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <CalendarDays size={100} className="text-white" />
                        </div>
                        <div className="p-4 rounded-full bg-emerald-100 text-emerald-600 shadow-sm z-10">
                            <DollarSign size={24} />
                        </div>
                        <div className="z-10">
                            <p className="text-white/80 text-sm font-bold flex items-center gap-1">
                                ยอดขายวันนี้ <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full text-white border border-emerald-400/30">Daily</span>
                            </p>
                            <h3 className="text-3xl font-bold text-white mt-1">฿{stats.dayRevenue.toLocaleString()}</h3>
                            <p className="text-white/50 text-xs mt-1">{stats.dayOrders} ออเดอร์</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex items-center gap-4 !bg-gradient-to-br !from-blue-500/20 !to-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <CalendarRange size={100} className="text-white" />
                        </div>
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 shadow-sm z-10">
                            <TrendingUp size={24} />
                        </div>
                        <div className="z-10">
                            <p className="text-white/80 text-sm font-bold flex items-center gap-1">
                                ยอดขายเดือนนี้ <span className="text-[10px] bg-blue-500/30 px-2 py-0.5 rounded-full text-white border border-blue-400/30">Monthly</span>
                            </p>
                            <h3 className="text-3xl font-bold text-white mt-1">฿{stats.monthRevenue.toLocaleString()}</h3>
                            <p className="text-white/50 text-xs mt-1">{stats.monthOrders} ออเดอร์</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex items-center gap-4 !bg-gradient-to-br !from-orange-500/20 !to-red-500/20 relative overflow-hidden">
                        <div className="p-4 rounded-full bg-orange-100 text-orange-600 shadow-sm z-10">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="z-10 w-full">
                            <p className="text-white/80 text-sm font-bold">เมนูยอดฮิต</p>
                            <h3 className="text-xl font-bold text-white truncate w-full mt-1">
                                {topSellingItemEntry ? topSellingItemEntry[0] : '-'}
                            </h3>
                            {topSellingItemEntry && <p className="text-white/50 text-xs mt-1">ขายไปแล้ว {topSellingItemEntry[1]} จาน</p>}
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/20">
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'orders' 
                                    ? 'bg-white text-slate-800 shadow-sm' 
                                    : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-2"><Clock size={16} /> ประวัติออเดอร์</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('reservations')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'reservations' 
                                    ? 'bg-white text-slate-800 shadow-sm' 
                                    : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-2"><Calendar size={16} /> รายการจอง</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('bills')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all relative ${
                                    activeTab === 'bills' 
                                    ? 'bg-white text-slate-800 shadow-sm' 
                                    : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Receipt size={16} /> 
                                    แจ้งเตือนบิล
                                    {tablesRequestingBill.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                            {tablesRequestingBill.length}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {activeTab !== 'bills' && (
                                <div className="relative">
                                    <select 
                                        value={filterTableDate}
                                        onChange={(e) => setFilterTableDate(e.target.value)}
                                        className="appearance-none bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full pl-4 pr-10 py-2 focus:outline-none hover:bg-white/20 transition cursor-pointer text-sm font-medium"
                                    >
                                        <option value="today" className="bg-slate-800 text-white">รายการวันนี้</option>
                                        <option value="all" className="bg-slate-800 text-white">รายการทั้งหมด</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
                                </div>
                            )}

                            <div className="relative flex-1 md:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                                <input 
                                    type="text" 
                                    placeholder={activeTab === 'orders' ? "ค้นหา Order ID..." : activeTab === 'bills' ? "ค้นหาโต๊ะ..." : "ค้นหาชื่อ..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:bg-white/20 transition text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <GlassCard className="overflow-hidden !bg-white/90">
                        <div className="overflow-x-auto min-h-[300px]">
                            {activeTab === 'bills' && (
                                <div className="p-6">
                                    {tablesRequestingBill.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                            <Bell size={48} className="mb-4 opacity-20" />
                                            <p>ไม่มีรายการเรียกเก็บเงินในขณะนี้</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {tablesRequestingBill.map(tableId => {
                                                const thisTableOrders = billRequests.filter(o => o.tableId === tableId);
                                                const billTotal = thisTableOrders.reduce((total, order) => {
                                                    return total + order.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
                                                }, 0);

                                                return (
                                                    <div key={tableId} className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h3 className="text-xl font-bold text-slate-800">โต๊ะ {tableId}</h3>
                                                                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200 animate-pulse">
                                                                    เรียกเช็คบิล
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1 mb-4">
                                                                <p className="text-sm text-slate-500">จำนวน: {thisTableOrders.length} ออเดอร์</p>
                                                                <p className="text-2xl font-bold text-slate-800">฿{billTotal.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <GlassButton 
                                                            onClick={() => setSelectedBillTableId(tableId)}
                                                            className="w-full !bg-gradient-to-r !from-emerald-500 !to-teal-500 !text-white !border-0 shadow-lg hover:shadow-emerald-500/30"
                                                        >
                                                            <CheckCircle size={18} className="mr-2" /> ตรวจสอบ / รับเงิน
                                                        </GlassButton>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/50 border-b border-slate-200">
                                            <th className="p-4 font-semibold text-slate-600 text-sm">Order ID</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">เวลา</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">โต๊ะ</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">รายการอาหาร</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm text-right">ยอดรวม</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm text-center">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tableOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                                    ไม่พบข้อมูลการสั่งซื้อ
                                                </td>
                                            </tr>
                                        ) : (
                                            tableOrders.sort((a,b) => {
                                                const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
                                                const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
                                                return dateB.getTime() - dateA.getTime();
                                            }).map((order) => {
                                                const orderTotal = (order.items || []).reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
                                                const orderDate = order.timestamp instanceof Date ? order.timestamp : new Date(order.timestamp);
                                                
                                                return (
                                                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                                                        <td className="p-4 text-sm font-mono text-slate-500">#{order.id.slice(0, 8)}</td>
                                                        <td className="p-4 text-sm text-slate-600">
                                                            {orderDate.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                                                            <span className="block text-xs text-slate-400">
                                                                {orderDate.toLocaleDateString('th-TH')}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 font-medium text-slate-800">โต๊ะ {order.tableId}</td>
                                                        <td className="p-4 text-sm text-slate-600 max-w-xs">
                                                            <div className="line-clamp-2">
                                                                {(order.items || []).map(i => `${i.name} x${i.qty}`).join(', ')}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm font-bold text-slate-800 text-right">฿{orderTotal.toLocaleString()}</td>
                                                        <td className="p-4 text-center">
                                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${
                                                                order.status === 'served' 
                                                                ? 'bg-green-500/10 text-green-700 border-green-500/20' 
                                                                : order.status === 'cooking' 
                                                                ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' 
                                                                : order.status === 'bill_requested'
                                                                ? 'bg-red-500/10 text-red-700 border-red-500/20'
                                                                : order.status === 'paid'
                                                                ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' 
                                                                : 'bg-gray-500/10 text-gray-700 border-gray-500/20'
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
                            )}

                            {activeTab === 'reservations' && (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/50 border-b border-slate-200">
                                            <th className="p-4 font-semibold text-slate-600 text-sm">ชื่อผู้จอง</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">เบอร์โทร</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">วันที่</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">เวลา</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">จำนวนคน</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm text-center">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tableReservations.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                                    ไม่พบข้อมูลการจอง
                                                </td>
                                            </tr>
                                        ) : (
                                            tableReservations.sort((a: any, b: any) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()).map((res: any) => (
                                                <tr key={res.id} className="hover:bg-slate-50/80 transition group">
                                                    <td className="p-4 font-bold text-slate-800">{res.name}</td>
                                                    <td className="p-4 text-sm text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} className="text-slate-400" />
                                                            {res.phone}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-600">
                                                        {new Date(res.date).toLocaleDateString('th-TH', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="p-4 text-sm font-medium text-slate-800">
                                                        <span className="bg-orange-500/10 text-orange-700 px-2 py-1 rounded-md border border-orange-500/20">
                                                            {res.time} น.
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Users size={16} className="text-slate-400" />
                                                            {res.guests} ท่าน
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="relative inline-block group-hover:shadow-md rounded-full transition-all">
                                                            <select
                                                                value={res.status || 'pending'}
                                                                onChange={(e) => updateReservationStatus(res.id, e.target.value)}
                                                                className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${getReservationStatusColor(res.status || 'pending')}`}
                                                            >
                                                                <option value="pending" className="bg-white text-slate-800">รอการยืนยัน</option>
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
                            )}
                        </div>
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
                            {isConfirmingPayment ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={18} className="animate-spin" /> กำลังบันทึก...
                                </span>
                            ) : "ยืนยันรับเงิน"}
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        )}
      </div>
    </>
  );
}