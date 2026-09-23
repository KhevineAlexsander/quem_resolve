import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Truck, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  ChevronRight, 
  Clock, 
  Filter,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, currentUser } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Group notifications into Hoje, Ontem, Anteriores
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { [key: string]: Notification[] } = {
    'Hoje': [],
    'Ontem': [],
    'Anteriores': [],
  };

  filteredNotifications.forEach(notif => {
    const notifDate = new Date(notif.created_at);
    if (isNaN(notifDate.getTime())) {
      groups['Hoje'].push(notif);
      return;
    }

    if (notifDate >= today) {
      groups['Hoje'].push(notif);
    } else if (notifDate >= yesterday) {
      groups['Ontem'].push(notif);
    } else {
      groups['Anteriores'].push(notif);
    }
  });

  const getNotificationIcon = (type: string, title: string) => {
    const t = (type + ' ' + title).toLowerCase();
    if (t.includes('caminho') || t.includes('on_the_way')) {
      return <Truck className="w-5 h-5 text-orange-400" />;
    }
    if (t.includes('chegou') || t.includes('arrived') || t.includes('local')) {
      return <MapPin className="w-5 h-5 text-emerald-400" />;
    }
    if (t.includes('iniciado') || t.includes('andamento') || t.includes('in_progress')) {
      return <Wrench className="w-5 h-5 text-blue-400" />;
    }
    if (t.includes('concluído') || t.includes('completed')) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (t.includes('agendado') || t.includes('scheduled')) {
      return <Calendar className="w-5 h-5 text-cyan-400" />;
    }
    if (t.includes('orçamento') || t.includes('quote')) {
      return <DollarSign className="w-5 h-5 text-amber-400" />;
    }
    if (t.includes('mensagem') || t.includes('chat')) {
      return <MessageSquare className="w-5 h-5 text-indigo-400" />;
    }
    return <Bell className="w-5 h-5 text-orange-400" />;
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read_at) {
      markNotificationRead(notif.id);
    }
    if (notif.data?.service_request_id) {
      navigate(`/solicitacoes/${notif.data.service_request_id}`);
    } else if (notif.data?.url) {
      navigate(notif.data.url);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white flex items-center gap-2">
              <span>Central de Notificações</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 font-black text-xs">
                  {unreadCount} novas
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Acompanhe avisos de orçamentos, chegadas e andamento em tempo real
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead(currentUser.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition cursor-pointer shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Marcar lidas</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            filter === 'unread'
              ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Não lidas ({unreadCount})
        </button>
      </div>

      {/* Grouped Lists */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm">Nenhuma notificação encontrada</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Você receberá atualizações quando técnicos enviarem orçamentos ou informarem status do serviço.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(['Hoje', 'Ontem', 'Anteriores'] as const).map(groupName => {
            const list = groups[groupName];
            if (!list || list.length === 0) return null;

            return (
              <div key={groupName} className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  {groupName}
                </h3>

                <div className="space-y-2">
                  {list.map(notif => {
                    const isUnread = !notif.read_at;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                          isUnread
                            ? 'bg-slate-900 border-orange-500/40 hover:border-orange-500/70 shadow-lg shadow-orange-950/10'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                              isUnread
                                ? 'bg-orange-500/10 border-orange-500/30 shadow-inner'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            {getNotificationIcon(notif.type, notif.title)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition">
                                {notif.title}
                              </h4>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(notif.created_at)}</span>
                              {notif.data?.service_request_id && (
                                <>
                                  <span>•</span>
                                  <span className="text-orange-400 font-bold group-hover:underline">
                                    Ver linha do tempo →
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition shrink-0 self-center" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
