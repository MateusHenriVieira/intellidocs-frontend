"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getNotifications, markNotificationRead, markAllRead, Notification } from "@/lib/api";
import { formatDate } from "@/lib/utils"; // <--- IMPORT NOVO

export function NotificationBell() {
  // ... (Mantenha os states e useEffects iguais) ...
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (e) { console.error("Erro notificações"); }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAll = async () => {
    setLoading(true);
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setLoading(false);
  };

  const handleReadOne = async (id: number) => {
    if (notifications.find(n => n.id === id)?.is_read) return;
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all ${isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
          
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAll} 
                disabled={loading}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3" />} 
                Marcar todas
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Você não tem notificações.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleReadOne(n.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className={`text-sm font-semibold ${!n.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                          {n.title}
                        </h4>
                        {!n.is_read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>}
                      </div>
                      <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-slate-600' : 'text-slate-400'}`}>
                        {n.message}
                      </p>
                      {/* AQUI A MUDANÇA: USA formatDate */}
                      <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                        {formatDate(n.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={() => setIsOpen(false)} className="text-xs font-medium text-slate-500 hover:text-slate-800">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}