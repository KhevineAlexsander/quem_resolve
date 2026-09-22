import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Check, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/notificationService';

export const NotificationModal: React.FC = () => {
  const { isNotificationsOpen, closeNotifications, notifications, refreshData } = useApp();
  const navigate = useNavigate();

  if (!isNotificationsOpen) return null;

  const handleNotificationClick = (n: any) => {
    notificationService.markRead(n.id);
    refreshData();
    closeNotifications();

    if (n.type === 'service_status' || n.type === 'quote_received') {
      navigate('/cliente');
    } else if (n.type === 'new_message') {
      navigate('/chat');
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => notificationService.markRead(n.id));
    refreshData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md text-white shadow-2xl overflow-hidden mt-12 sm:mt-0 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-slate-100">Notificações</h3>
            <span className="text-[11px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read_at).length} novas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Marcar todas como lidas
            </button>
            <button
              onClick={closeNotifications}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-800">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma notificação no momento.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 hover:bg-slate-800/60 transition cursor-pointer flex items-start gap-3 ${
                  !item.read_at ? 'bg-slate-800/30' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.message}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
