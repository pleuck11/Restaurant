export interface TableData {
  id: number;
  name: string;
  seats: number;
  zone: 'Indoor (ห้องแอร์)' | 'Outdoor (รับลมธรรมชาติ)' | 'VIP (ห้องส่วนตัว)';
  status: 'available' | 'occupied' | 'reserved';
}

export const TABLES_DATA: TableData[] = [
  { id: 1, name: 'โต๊ะ 1', seats: 2, zone: 'Indoor (ห้องแอร์)', status: 'available' },
  { id: 2, name: 'โต๊ะ 2', seats: 4, zone: 'Indoor (ห้องแอร์)', status: 'occupied' },
  { id: 3, name: 'โต๊ะ 3', seats: 4, zone: 'Indoor (ห้องแอร์)', status: 'available' },
  { id: 4, name: 'โต๊ะ 4', seats: 6, zone: 'Indoor (ห้องแอร์)', status: 'available' },
  { id: 5, name: 'โต๊ะ 5', seats: 4, zone: 'Outdoor (รับลมธรรมชาติ)', status: 'occupied' },
  { id: 6, name: 'โต๊ะ 6', seats: 4, zone: 'Outdoor (รับลมธรรมชาติ)', status: 'available' },
  { id: 7, name: 'โต๊ะ 7', seats: 8, zone: 'Outdoor (รับลมธรรมชาติ)', status: 'reserved' },
  { id: 8, name: 'โต๊ะ 8 (VIP)', seats: 10, zone: 'VIP (ห้องส่วนตัว)', status: 'available' },
];
