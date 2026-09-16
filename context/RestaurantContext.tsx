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
  getDocs
} from 'firebase/firestore';

import { 
  MENU_ITEMS_DATA, 
  TABLES_DATA, 
  DEMO_ORDERS, 
  DEMO_RESERVATIONS, 
  MenuItemData, 
  TableData 
} from '@/data';

// Types
export interface MenuItem {
  id: string | number;
  name: string;
  nameEn?: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  qty?: number;
  spicyLevel?: number;
  isPopular?: boolean;
  isSignature?: boolean;
}

export interface Order {
  id: string;
  tableId: number;
  items: MenuItem[];
  status: 'pending' | 'cooking' | 'served' | 'bill_requested' | 'paid';
  timestamp: Date | any;
}

export type Table = TableData;

interface RestaurantContextType {
  cart: MenuItem[];
  orders: Order[];
  reservations: any[];
  selectedTable: Table | null;
  isLoading: boolean;
  isHydrated: boolean;
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
  resetDemoData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Export Menu Items and Tables for backward compatibility and direct usage
export const MENU_ITEMS: MenuItem[] = MENU_ITEMS_DATA as MenuItem[];
export const TABLES: Table[] = TABLES_DATA;

// Firebase Config จาก Environment Variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const PROJECT_COLLECTION = 'restaurant';

// Initialize Firebase safely
let app: any = null;
let auth: any = null;
let db: any = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase init skipped or failed, running in Demo Mode with local storage:", e);
}

// Local Storage Keys
const STORAGE_KEYS = {
  MENU: 'restaurant_demo_menu_v2',
  ORDERS: 'restaurant_demo_orders_v2',
  RESERVATIONS: 'restaurant_demo_reservations_v2',
  TABLE: 'restaurant_demo_table_v2',
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Deterministic initial states for SSR matching
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS_DATA as MenuItem[]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [reservations, setReservations] = useState<any[]>(DEMO_RESERVATIONS);
  const [selectedTable, setSelectedTableState] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage only on client after mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const savedMenu = localStorage.getItem(STORAGE_KEYS.MENU);
      if (savedMenu) {
        setMenuItems(JSON.parse(savedMenu));
      }
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed.map((o: any) => ({
          ...o,
          timestamp: new Date(o.timestamp),
        })));
      }
      const savedRes = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      if (savedRes) {
        setReservations(JSON.parse(savedRes));
      }
      const savedTable = localStorage.getItem(STORAGE_KEYS.TABLE);
      if (savedTable) {
        setSelectedTableState(JSON.parse(savedTable));
      }
    } catch (e) {
      console.warn("Failed to load local storage state:", e);
    }
    setIsHydrated(true);
  }, []);

  // Sync state changes to Local Storage only after hydration is complete
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
    } catch (e) {}
  }, [menuItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {}
  }, [orders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    } catch (e) {}
  }, [reservations, isHydrated]);

  const setSelectedTable = (table: Table | null) => {
    setSelectedTableState(table);
    try {
      if (table) {
        localStorage.setItem(STORAGE_KEYS.TABLE, JSON.stringify(table));
      } else {
        localStorage.removeItem(STORAGE_KEYS.TABLE);
      }
    } catch (e) {}
  };

  // 1. Firebase Authentication (if configured)
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.warn("Firebase Auth Error, staying in offline demo mode:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firebase Realtime Sync (if user logged in & Firestore is available)
  useEffect(() => {
    if (!user || !db) return;

    // Sync Orders
    const ordersRef = collection(db, PROJECT_COLLECTION, 'orders', 'list');
    const qOrders = query(ordersRef); 

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      if (!snapshot.empty) {
        const loadedOrders = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          };
        }) as Order[];
        setOrders(loadedOrders);
      }
    }, (error) => {
      console.warn("Orders Firebase sync error:", error);
    });

    // Sync Reservations
    const reservationsRef = collection(db, PROJECT_COLLECTION, 'reservations', 'list');
    const qReservations = query(reservationsRef);

    const unsubReservations = onSnapshot(qReservations, (snapshot) => {
      if (!snapshot.empty) {
        const loadedReservations = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id
          };
        });
        setReservations(loadedReservations);
      }
    }, (error) => console.warn("Reservations Firebase sync error:", error));

    // Sync Menu Items
    const menuItemsRef = collection(db, PROJECT_COLLECTION, 'menuItems', 'list');
    const qMenuItems = query(menuItemsRef);

    const unsubMenuItems = onSnapshot(qMenuItems, (snapshot) => {
      if (snapshot.empty && user) {
        // Seed initial data with real food photos if Firestore is empty
        console.log("Seeding menu with real food images to Firestore...");
        MENU_ITEMS_DATA.forEach((item) => {
          addDoc(menuItemsRef, {
            name: item.name,
            nameEn: item.nameEn || '',
            description: item.description || '',
            category: item.category,
            price: item.price,
            image: item.image,
            spicyLevel: item.spicyLevel ?? 0,
            isPopular: item.isPopular ?? false,
            isSignature: item.isSignature ?? false,
          }).catch(console.error);
        });
        setMenuItems(MENU_ITEMS_DATA as MenuItem[]);
      } else if (!snapshot.empty) {
        // Check if existing items still use old emoji format
        const hasOldEmojiFormat = snapshot.docs.some(doc => {
          const img = doc.data().image;
          return !img || (!img.startsWith('/') && !img.startsWith('http'));
        });

        if (hasOldEmojiFormat && user) {
          console.log("Upgrading old Firestore emoji items with real food photos...");
          snapshot.docs.forEach(d => deleteDoc(d.ref).catch(console.error));
          MENU_ITEMS_DATA.forEach((item) => {
            addDoc(menuItemsRef, {
              name: item.name,
              nameEn: item.nameEn || '',
              description: item.description || '',
              category: item.category,
              price: item.price,
              image: item.image,
              spicyLevel: item.spicyLevel ?? 0,
              isPopular: item.isPopular ?? false,
              isSignature: item.isSignature ?? false,
            }).catch(console.error);
          });
          setMenuItems(MENU_ITEMS_DATA as MenuItem[]);
        } else {
          const loadedMenuItems = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id
            } as MenuItem;
          });
          setMenuItems(loadedMenuItems);
        }
      }
    }, (error) => console.warn("Menu items Firebase sync error:", error));

    return () => {
      unsubOrders();
      unsubReservations();
      unsubMenuItems();
    };
  }, [user]);

  // --- Reset Demo Data Function ---
  const resetDemoData = async () => {
    setMenuItems(MENU_ITEMS_DATA as MenuItem[]);
    setOrders(DEMO_ORDERS);
    setReservations(DEMO_RESERVATIONS);
    setCart([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.MENU);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
      localStorage.removeItem(STORAGE_KEYS.TABLE);
    } catch (e) {}

    if (db && user) {
      try {
        const menuItemsRef = collection(db, PROJECT_COLLECTION, 'menuItems', 'list');
        const snap = await getDocs(query(menuItemsRef));
        snap.docs.forEach(d => deleteDoc(d.ref).catch(console.error));
        MENU_ITEMS_DATA.forEach((item) => {
          addDoc(menuItemsRef, {
            name: item.name,
            nameEn: item.nameEn || '',
            description: item.description || '',
            category: item.category,
            price: item.price,
            image: item.image,
            spicyLevel: item.spicyLevel ?? 0,
            isPopular: item.isPopular ?? false,
            isSignature: item.isSignature ?? false,
          }).catch(console.error);
        });
      } catch (e) {
        console.warn("Reset Firebase error:", e);
      }
    }
  };

  // --- Cart Actions ---
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
    if (cart.length === 0 || !selectedTable) return;
    
    const newOrder: Order = {
      id: 'ord-' + Date.now().toString().slice(-6),
      tableId: selectedTable.id,
      items: [...cart],
      status: 'pending',
      timestamp: new Date(), 
    };

    // Optimistic local update
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);

    // Firebase update if online
    if (db && user) {
      try {
        await addDoc(collection(db, PROJECT_COLLECTION, 'orders', 'list'), newOrder);
      } catch (error) {
        console.warn("Firebase place order error:", error);
      }
    }
  };

  const checkBill = async () => {
    if (!selectedTable) return;

    // Optimistic local update
    setOrders(prev => prev.map(order => 
      order.tableId === selectedTable.id && order.status !== 'paid'
        ? { ...order, status: 'bill_requested' }
        : order
    ));

    // Firebase update if online
    if (db && user) {
      try {
        const tableOrders = orders.filter(o => o.tableId === selectedTable.id && o.status !== 'bill_requested' && o.status !== 'paid');
        const updatePromises = tableOrders.map(order => 
          updateDoc(doc(db, PROJECT_COLLECTION, 'orders', 'list', order.id), { status: 'bill_requested' })
        );
        await Promise.all(updatePromises);
      } catch (error) {
        console.warn("Check bill firebase error:", error);
      }
    }
  };

  const confirmPayment = async (orderIds: string[]) => {
    if (orderIds.length === 0) return;

    // Optimistic local update
    setOrders(prev => prev.map(order => 
      orderIds.includes(String(order.id)) ? { ...order, status: 'paid' } : order
    ));

    // Firebase update if online
    if (db && user) {
      try {
        const updatePromises = orderIds.map(id => 
          updateDoc(doc(db, PROJECT_COLLECTION, 'orders', 'list', String(id)), { status: 'paid' })
        );
        await Promise.all(updatePromises);
      } catch (error) {
        console.warn("Confirm payment firebase error:", error);
      }
    }
  };

  const updateOrderStatus = async (orderId: string | number, status: Order['status']) => {
    // Optimistic local update
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));

    // Firebase update if online
    if (db && user) {
      try {
        const orderRef = doc(db, PROJECT_COLLECTION, 'orders', 'list', String(orderId));
        await updateDoc(orderRef, { status });
      } catch (error) {
        console.warn("Update status firebase error:", error);
      }
    }
  };

  const updateReservationStatus = async (id: string | number, status: string) => {
    // Optimistic local update
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, status } : res
    ));

    // Firebase update if online
    if (db && user) {
      try {
        const resRef = doc(db, PROJECT_COLLECTION, 'reservations', 'list', String(id));
        await updateDoc(resRef, { status });
      } catch (error) {
        console.warn("Update reservation status firebase error:", error);
      }
    }
  };

  const addReservation = async (res: any) => {
    const newRes = {
      ...res,
      id: 'res-' + Date.now().toString().slice(-6),
      status: 'pending',
    };

    // Optimistic local update
    setReservations(prev => [newRes, ...prev]);

    // Firebase update if online
    if (db && user) {
      try {
        await addDoc(collection(db, PROJECT_COLLECTION, 'reservations', 'list'), newRes);
      } catch (error) {
        console.warn("Add reservation firebase error:", error);
      }
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'menu-' + Date.now().toString().slice(-6),
    };

    // Optimistic local update
    setMenuItems(prev => [...prev, newItem]);

    // Firebase update if online
    if (db && user) {
      try {
        await addDoc(collection(db, PROJECT_COLLECTION, 'menuItems', 'list'), newItem);
      } catch (error) {
        console.warn("Add menu item firebase error:", error);
      }
    }
  };

  const updateMenuItem = async (id: string | number, item: Partial<MenuItem>) => {
    // Optimistic local update
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...item } : m));

    // Firebase update if online
    if (db && user) {
      try {
        const menuRef = doc(db, PROJECT_COLLECTION, 'menuItems', 'list', String(id));
        await updateDoc(menuRef, item);
      } catch (error) {
        console.warn("Update menu item firebase error:", error);
      }
    }
  };

  const deleteMenuItem = async (id: string | number) => {
    // Optimistic local update
    setMenuItems(prev => prev.filter(m => m.id !== id));

    // Firebase update if online
    if (db && user) {
      try {
        const menuRef = doc(db, PROJECT_COLLECTION, 'menuItems', 'list', String(id));
        await deleteDoc(menuRef);
      } catch (error) {
        console.warn("Delete menu item firebase error:", error);
      }
    }
  };

  return (
    <RestaurantContext.Provider value={{
      menuItems, cart, orders, reservations, selectedTable, isLoading, isHydrated,
      addToCart, updateQty, placeOrder, checkBill, confirmPayment, setSelectedTable, 
      updateOrderStatus, updateReservationStatus, addReservation,
      addMenuItem, updateMenuItem, deleteMenuItem, resetDemoData
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