export interface DemoReservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  note?: string;
}

const todayStr = new Date().toISOString().split('T')[0];

export const DEMO_RESERVATIONS: DemoReservation[] = [
  {
    id: 'res-1',
    name: 'คุณสมชาย วงศ์สวัสดิ์',
    phone: '081-234-5678',
    date: todayStr,
    time: '18:30',
    guests: 4,
    status: 'confirmed',
    note: 'ขอโต๊ะริมหน้าต่าง',
  },
  {
    id: 'res-2',
    name: 'คุณพรทิพย์ สุวรรณภูมิ',
    phone: '089-876-5432',
    date: todayStr,
    time: '19:00',
    guests: 6,
    status: 'pending',
    note: 'มีเด็กเล็ก 1 คน ต้องการเก้าอี้เด็ก',
  },
  {
    id: 'res-3',
    name: 'คุณเอกชัย กิตติคุณ',
    phone: '086-555-1234',
    date: todayStr,
    time: '20:00',
    guests: 8,
    status: 'confirmed',
    note: 'จัดเลี้ยงวันเกิด สั่งห้อง VIP',
  },
  {
    id: 'res-4',
    name: 'คุณณิชา รัตนเวช',
    phone: '092-111-9876',
    date: todayStr,
    time: '12:30',
    guests: 2,
    status: 'completed',
  },
];
