'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  updateDoc, 
  doc, 
  deleteDoc, 
  Timestamp 
} from 'firebase/firestore';

// Types
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  qty?: number;
}

export interface Order {
  id: string;
  tableId: number;
  items: MenuItem[];
  // เพิ่มสถานะ 'paid' เพื่อเก็บประวัติ
  status: 'pending' | 'cooking' | 'served' | 'bill_requested' | 'paid';
  timestamp: Date | any;
}

interface Table {
  id: number;
  name: string;
}

interface RestaurantContextType {
  cart: MenuItem[];
  orders: Order[];
  reservations: any[];
  selectedTable: Table | null;
  isLoading: boolean;
  addToCart: (item: MenuItem) => void;
  updateQty: (itemId: number, change: number) => void;
  placeOrder: () => Promise<void>;
  checkBill: () => Promise<void>;
  confirmPayment: (tableId: number) => Promise<void>;
  setSelectedTable: (table: Table | null) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateReservationStatus: (id: string, status: string) => void;
  addReservation: (res: any) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Mock Data
export const MENU_ITEMS = [
  { id: 1, name: 'ต้มยำกุ้งน้ำข้น', category: 'ต้ม/แกง', price: 250, image: '🍲' },
  { id: 2, name: 'ผัดไทยกุ้งสด', category: 'อาหารจานเดียว', price: 120, image: '🍝' },
  { id: 3, name: 'ส้มตำไทย', category: 'ยำ/ตำ', price: 80, image: '🥗' },
  { id: 4, name: 'ไก่ย่างสมุนไพร', category: 'ย่าง/ทอด', price: 180, image: '🍗' },
  { id: 5, name: 'ข้าวผัดปู', category: 'อาหารจานเดียว', price: 150, image: '🍚' },
  { id: 6, name: 'น้ำแตงโมปั่น', category: 'เครื่องดื่ม', price: 60, image: '🍉' },
  { id: 7, name: 'ชามะนาว', category: 'เครื่องดื่ม', price: 45, image: '🍋' },
  { id: 8, name: 'ปลากะพงทอดน้ำปลา', category: 'ย่าง/ทอด', price: 450, image: '🐟' },
];

export const TABLES = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `โต๊ะ ${i + 1}` }));

// Config Firebase ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyCZQIN1_uf9E26j-3x5Hv1KsWKOermVjd0",
  authDomain: "restaurant-7b466.firebaseapp.com",
  projectId: "restaurant-7b466",
  storageBucket: "restaurant-7b466.firebasestorage.app",
  messagingSenderId: "850480414202",
  appId: "1:850480414202:web:634b37546cacf3cc26f843"
};

const appId = 'restaurant-7b466';

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Authentication
  useEffect(() => {
    if (!auth) {
        setIsLoading(false);
        return;
    }
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Sync
  useEffect(() => {
    if (!user || !db) return;

    // Sync Orders
    const ordersRef = collection(db, 'orders');
    const qOrders = query(ordersRef); 

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        };
      }) as Order[];
      setOrders(loadedOrders);
      setIsLoading(false);
    }, (error) => {
      console.error("Orders sync error:", error);
      setIsLoading(false);
    });

    // Sync Reservations
    const reservationsRef = collection(db, 'reservations');
    const qReservations = query(reservationsRef);

    const unsubReservations = onSnapshot(qReservations, (snapshot) => {
      const loadedReservations = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data
        };
      });
      setReservations(loadedReservations);
    }, (error) => console.error("Reservations sync error:", error));

    return () => {
      unsubOrders();
      unsubReservations();
    };
  }, [user]);


  // --- Actions ---

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: (i.qty || 1) + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (itemId: number, change: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(0, (i.qty || 0) + change);
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(i => (i.qty || 0) > 0));
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !selectedTable || !db || !user) return;
    try {
        const newOrder = {
          tableId: selectedTable.id,
          items: [...cart],
          status: 'pending',
          timestamp: new Date(), 
        };
        await addDoc(collection(db, 'orders'), newOrder);
        setCart([]);
    } catch (error) {
        console.error("Place order error:", error);
        throw error;
    }
  };

  const checkBill = async () => {
    if (!selectedTable || !db || !user) return;
    try {
        const tableOrders = orders.filter(o => o.tableId === selectedTable.id && o.status !== 'bill_requested' && o.status !== 'paid');
        const updatePromises = tableOrders.map(order => 
            updateDoc(doc(db, 'orders', order.id), { status: 'bill_requested' })
        );
        await Promise.all(updatePromises);
    } catch (error) {
        console.error("Check bill error:", error);
        throw error;
    }
  };

  // [แก้ไขสำคัญ]: เปลี่ยนจากลบออเดอร์ เป็นอัปเดตสถานะเป็น 'paid' เพื่อเก็บประวัติ
  const confirmPayment = async (tableId: number) => {
    if (!db || !user) return;
    try {
        // หาออเดอร์ของโต๊ะนี้ที่ยังไม่ได้จ่ายเงิน
        const tableOrders = orders.filter(o => o.tableId === tableId && o.status !== 'paid');
        
        // อัปเดตสถานะเป็น 'paid' แทนการ deleteDoc
        const updatePromises = tableOrders.map(order => 
            updateDoc(doc(db, 'orders', order.id), { status: 'paid' })
        );
        
        await Promise.all(updatePromises);
        
        if (selectedTable?.id === tableId) {
            setSelectedTable(null);
        }
    } catch (error) {
        console.error("Confirm payment error:", error);
        throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!db || !user) return;
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
    } catch (error) {
        console.error("Update status error:", error);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    if (!db || !user) return;
    try {
        const resRef = doc(db, 'reservations', id);
        await updateDoc(resRef, { status });
    } catch (error) {
        console.error("Update reservation status error:", error);
    }
  };

  const addReservation = async (res: any) => {
    if (!db || !user) return;
    try {
        await addDoc(collection(db, 'reservations'), res);
    } catch (error) {
        console.error("Add reservation error:", error);
        throw error;
    }
  };

  return (
    <RestaurantContext.Provider value={{
      cart, orders, reservations, selectedTable, isLoading,
      addToCart, updateQty, placeOrder, checkBill, confirmPayment, setSelectedTable, updateOrderStatus, updateReservationStatus, addReservation
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider');
  return context;
};