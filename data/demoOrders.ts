import { Order } from '@/context/RestaurantContext';

export const DEMO_ORDERS: Order[] = [
  {
    id: 'demo-order-1',
    tableId: 2,
    items: [
      {
        id: 1,
        name: 'ต้มยำกุ้งน้ำข้น',
        category: 'ต้ม/แกง',
        price: 250,
        image: '/images/dishes/tomyum.jpg',
        qty: 1,
      },
      {
        id: 5,
        name: 'ข้าวผัดเนื้อปูก้อน',
        category: 'อาหารจานเดียว',
        price: 180,
        image: '/images/dishes/khaopadpu.jpg',
        qty: 2,
      },
      {
        id: 10,
        name: 'ชาไทยโบราณเย็น',
        category: 'เครื่องดื่ม',
        price: 55,
        image: '/images/dishes/thaitea.jpg',
        qty: 2,
      },
    ],
    status: 'cooking',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
  },
  {
    id: 'demo-order-2',
    tableId: 5,
    items: [
      {
        id: 3,
        name: 'ส้มตำไทยไข่เค็ม',
        category: 'ยำ/ตำ',
        price: 90,
        image: '/images/dishes/somtum.jpg',
        qty: 1,
      },
      {
        id: 4,
        name: 'ไก่ย่างสมุนไพร',
        category: 'ย่าง/ทอด',
        price: 180,
        image: '/images/dishes/gaiyang.jpg',
        qty: 1,
      },
      {
        id: 8,
        name: 'คอหมูย่างน้ำจิ้มแจ่ว',
        category: 'ย่าง/ทอด',
        price: 150,
        image: '/images/dishes/mooyang.jpg',
        qty: 1,
      },
    ],
    status: 'pending',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
  },
  {
    id: 'demo-order-3',
    tableId: 3,
    items: [
      {
        id: 6,
        name: 'ปลากะพงทอดน้ำปลา',
        category: 'ย่าง/ทอด',
        price: 450,
        image: '/images/dishes/seabass.jpg',
        qty: 1,
      },
      {
        id: 2,
        name: 'ผัดไทยกุ้งสด',
        category: 'อาหารจานเดียว',
        price: 120,
        image: '/images/dishes/padthai.jpg',
        qty: 1,
      },
      {
        id: 9,
        name: 'ข้าวเหนียวมะม่วงอกร่อง',
        category: 'ของหวาน',
        price: 120,
        image: '/images/dishes/mangorice.jpg',
        qty: 1,
      },
      {
        id: 11,
        name: 'น้ำแตงโมปั่นสด',
        category: 'เครื่องดื่ม',
        price: 65,
        image: '/images/dishes/watermelon.jpg',
        qty: 2,
      },
    ],
    status: 'bill_requested',
    timestamp: new Date(Date.now() - 40 * 60 * 1000), // 40 mins ago
  },
  {
    id: 'demo-order-4',
    tableId: 1,
    items: [
      {
        id: 2,
        name: 'ผัดไทยกุ้งสด',
        category: 'อาหารจานเดียว',
        price: 120,
        image: '/images/dishes/padthai.jpg',
        qty: 2,
      },
      {
        id: 12,
        name: 'น้ำมะนาวโซดาน้ำผึ้ง',
        category: 'เครื่องดื่ม',
        price: 60,
        image: '/images/dishes/limesoda.jpg',
        qty: 2,
      },
    ],
    status: 'paid',
    timestamp: new Date(Date.now() - 65 * 60 * 1000), // 1 hour ago
  },
];
