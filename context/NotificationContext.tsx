'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GlassCard, GlassButton } from '@/components/ui/Glass';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextType {
  showAlert: (message: string, type?: NotificationType) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; type: NotificationType }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  const showAlert = (message: string, type: NotificationType = 'info') => {
    setAlertState({ isOpen: true, message, type });
    if (type !== 'error') {
      setTimeout(() => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
      }, 3000);
    }
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, message, onConfirm });
  };

  const closeAlert = () => setAlertState(prev => ({ ...prev, isOpen: false }));
  
  const handleConfirm = () => {
    if (confirmState.onConfirm) confirmState.onConfirm();
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Alert Modal */}
      {alertState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <GlassCard className="p-6 max-w-sm w-full flex flex-col items-center text-center !bg-white border border-stone-200 shadow-2xl relative rounded-3xl">
            <button onClick={closeAlert} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 cursor-pointer">
              <X size={20} />
            </button>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              alertState.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' :
              alertState.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200/60' :
              'bg-amber-50 text-amber-600 border border-amber-200/60'
            }`}>
              {alertState.type === 'success' ? <CheckCircle size={32} /> :
               alertState.type === 'error' ? <AlertCircle size={32} /> :
               <Info size={32} />}
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">
              {alertState.type === 'success' ? 'สำเร็จ!' : alertState.type === 'error' ? 'ข้อผิดพลาด' : 'แจ้งเตือน'}
            </h3>
            <p className="text-stone-600 text-sm mb-6">{alertState.message}</p>
            <GlassButton onClick={closeAlert} active className={`w-full py-3.5 ${
              alertState.type === 'success' ? '!bg-gradient-to-r !from-emerald-500 !to-teal-600' :
              alertState.type === 'error' ? '!bg-gradient-to-r !from-rose-500 !to-red-600' :
              '!bg-gradient-to-r !from-amber-500 !to-orange-600'
            } border-0 text-white font-bold rounded-xl shadow-md`}>
              ตกลง
            </GlassButton>
          </GlassCard>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <GlassCard className="p-6 max-w-sm w-full flex flex-col items-center text-center !bg-white border border-stone-200 shadow-2xl rounded-3xl">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-amber-50 text-amber-600 border border-amber-200/60">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">ยืนยันการดำเนินการ</h3>
            <p className="text-stone-600 text-sm mb-6">{confirmState.message}</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={closeConfirm}
                className="flex-1 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition border border-stone-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <GlassButton 
                onClick={handleConfirm}
                active
                className="flex-1 py-3 !bg-gradient-to-r !from-amber-500 !to-orange-600 border-0 text-white font-bold shadow-md shadow-orange-500/25 rounded-xl"
              >
                ยืนยัน
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
