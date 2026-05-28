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
  id: string | number;
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
  menuItems: MenuItem[];
  addToCart: (item: MenuItem) => void;
  updateQty: (itemId: string | number, change: number) => void;
  placeOrder: () => Promise<void>;
  checkBill: () => Promise<void>;
  confirmPayment: (orderIds: string[]) => Promise<void>;
  setSelectedTable: (table: Table | null) => void;
  updateOrderStatus: (orderId: string | number, status: Order['status']) => void;
  updateReservationStatus: (id: string | number, status: string) => void;
  addReservation: (res: any) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string | number, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string | number) => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Mock Data
export const MENU_ITEMS = [
  { id: 1, name: 'ต้มยำกุ้งน้ำข้น.', category: 'ต้ม/แกง', price: 250, image: '🍲' },
  { id: 2, name: 'ผัดไทยกุ้งสด', category: 'อาหารจานเดียว', price: 120, image: '🍝' },
  { id: 3, name: 'ส้มตำไทย', category: 'ยำ/ตำ', price: 80, image: '🥗' },
  { id: 4, name: 'ไก่ย่างสมุนไพร', category: 'ย่าง/ทอด', price: 180, image: '🍗' },
  { id: 5, name: 'ข้าวผัดปู', category: 'อาหารจานเดียว', price: 150, image: '🍚' },
  { id: 6, name: 'น้ำแตงโมปั่น', category: 'เครื่องดื่ม', price: 60, image: '🍉' },
  { id: 7, name: 'ชามะนาว', category: 'เครื่องดื่ม', price: 45, image: '🍋' },
  { id: 8, name: 'ปลากะพงทอดน้ำปลา', category: 'ย่าง/ทอด', price: 450, image: '🐟' },
];

export const TABLES = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `โต๊ะ ${i + 1}` }));

// Firebase Config จาก Environment Variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Collection ID สำหรับโปรเจคนี้
const PROJECT_COLLECTION = 'restaurant';

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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

    // Sync Orders (sub-collection ภายใต้ restaurant/config)
    const ordersRef = collection(db, PROJECT_COLLECTION, 'orders', 'list');
    const qOrders = query(ordersRef); 

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        };
      }) as Order[];
      setOrders(loadedOrders);
      setIsLoading(false);
    }, (error) => {
      console.error("Orders sync error:", error);
      setIsLoading(false);
    });

    // Sync Reservations (sub-collection ภายใต้ restaurant/config)
    const reservationsRef = collection(db, PROJECT_COLLECTION, 'reservations', 'list');
    const qReservations = query(reservationsRef);

    const unsubReservations = onSnapshot(qReservations, (snapshot) => {
      const loadedReservations = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id
        };
      });
      setReservations(loadedReservations);
    }, (error) => console.error("Reservations sync error:", error));

    // Sync Menu Items
    const menuItemsRef = collection(db, PROJECT_COLLECTION, 'menuItems', 'list');
    const qMenuItems = query(menuItemsRef);

    const unsubMenuItems = onSnapshot(qMenuItems, (snapshot) => {
      if (snapshot.empty && user) {
        // Seed mock data if empty
        console.log("Seeding initial menu items...");
        MENU_ITEMS.forEach((item) => {
          addDoc(menuItemsRef, {
            name: item.name,
            category: item.category,
            price: item.price,
            image: item.image,
          }).catch(console.error);
        });
      }

      const loadedMenuItems = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as MenuItem;
      });
      setMenuItems(loadedMenuItems);
    }, (error) => console.error("Menu items sync error:", error));

    return () => {
      unsubOrders();
      unsubReservations();
      unsubMenuItems();
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

  const updateQty = (itemId: string | number, change: number) => {
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
        await addDoc(collection(db, PROJECT_COLLECTION, 'orders', 'list'), newOrder);
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
            updateDoc(doc(db, PROJECT_COLLECTION, 'orders', 'list', order.id), { status: 'bill_requested' })
        );
        await Promise.all(updatePromises);
    } catch (error) {
        console.error("Check bill error:", error);
        throw error;
    }
  };

  // [แก้ไขสำคัญ]: เปลี่ยนจากลบออเดอร์ เป็นอัปเดตสถานะเป็น 'paid' เพื่อเก็บประวัติ
  // [แก้ไขล่าสุด]: รองรับการรับชำระเงินหลายบิลพร้อมกัน (รับ array ของ orderId)
  const confirmPayment = async (orderIds: string[]) => {
    if (!db || !user || orderIds.length === 0) return;
    try {
        const updatePromises = orderIds.map(id => 
            updateDoc(doc(db, PROJECT_COLLECTION, 'orders', 'list', String(id)), { status: 'paid' })
        );
        
        await Promise.all(updatePromises);
        
        // ถ้าโต๊ะปัจจุบันถูกจ่ายเงินหมดแล้ว (เคลียร์ให้ถ้าจำเป็น)
        // จริงๆ ควรเช็คว่าบิลของโต๊ะนี้ถูกจ่ายหมดไหม แต่เพื่อให้ง่าย ลบออกไปก่อน
    } catch (error) {
        console.error("Confirm payment error:", error);
        throw error;
    }
  };

  const updateOrderStatus = async (orderId: string | number, status: Order['status']) => {
    if (!db || !user) return;
    try {
        const orderRef = doc(db, PROJECT_COLLECTION, 'orders', 'list', String(orderId));
        await updateDoc(orderRef, { status });
    } catch (error) {
        console.error("Update status error:", error);
    }
  };

  const updateReservationStatus = async (id: string | number, status: string) => {
    if (!db || !user) return;
    try {
        const resRef = doc(db, PROJECT_COLLECTION, 'reservations', 'list', String(id));
        await updateDoc(resRef, { status });
    } catch (error) {
        console.error("Update reservation status error:", error);
    }
  };

  const addReservation = async (res: any) => {
    if (!db || !user) return;
    try {
        await addDoc(collection(db, PROJECT_COLLECTION, 'reservations', 'list'), res);
    } catch (error) {
        console.error("Add reservation error:", error);
        throw error;
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    if (!db || !user) return;
    try {
      await addDoc(collection(db, PROJECT_COLLECTION, 'menuItems', 'list'), item);
    } catch (error) {
      console.error("Add menu item error:", error);
      throw error;
    }
  };

  const updateMenuItem = async (id: string | number, item: Partial<MenuItem>) => {
    if (!db || !user) return;
    try {
      const menuRef = doc(db, PROJECT_COLLECTION, 'menuItems', 'list', String(id));
      await updateDoc(menuRef, item);
    } catch (error) {
      console.error("Update menu item error:", error);
      throw error;
    }
  };

  const deleteMenuItem = async (id: string | number) => {
    if (!db || !user) return;
    try {
      const menuRef = doc(db, PROJECT_COLLECTION, 'menuItems', 'list', String(id));
      await deleteDoc(menuRef);
    } catch (error) {
      console.error("Delete menu item error:", error);
      throw error;
    }
  };

  return (
    <RestaurantContext.Provider value={{
      menuItems, cart, orders, reservations, selectedTable, isLoading,
      addToCart, updateQty, placeOrder, checkBill, confirmPayment, setSelectedTable, updateOrderStatus, updateReservationStatus, addReservation,
      addMenuItem, updateMenuItem, deleteMenuItem
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