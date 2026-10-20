import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { formatDateTime } from '../utils/formatters';
import { Bell, CheckCheck, Clock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">Operational system messages, inventory alerts, and request updates</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No notifications found.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`p-5 flex items-start space-x-4 transition-colors ${
                n.isRead ? 'bg-white' : 'bg-blood-50/30'
              }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl shrink-0">
                <Bell className="w-5 h-5 text-blood-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${!n.isRead ? 'text-blood-900' : 'text-slate-800'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(n.createdAt)}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
