'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, QrCode, ChefHat } from 'lucide-react';

const navItems = [
  { href: '/', label: 'หน้าหลัก', icon: Home },
  { href: '/reservation', label: 'จองโต๊ะ', icon: Calendar },
  { href: '/scan', label: 'สแกน', icon: QrCode },
  { href: '/kitchen', label: 'ครัว', icon: ChefHat },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // ซ่อน Bottom Nav ในหน้า ordering (ใช้ bottom sheet แทน) และ admin
  if (pathname === '/ordering' || pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Backdrop blur background */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-t border-white/30 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]" />
      
      <div className="relative flex items-center justify-around px-2 pt-2 pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-300 min-w-[64px] ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-600 active:scale-90'
              }`}
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-500/30 scale-110' 
                  : ''
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold transition-all duration-300 ${
                isActive ? 'text-orange-600' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
