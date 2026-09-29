/**
 * src/pages/NotificationsPage.tsx — In-app notification center.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Bell, CheckCheck, Clock, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Notification } from '../../shared/types';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const items = await api.notifications.list();
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      loadNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      loadNotifications();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Activity Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Notifications Center
          </h1>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-xl border border-teal-200 dark:border-teal-800 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <Bell className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">You're all caught up!</h3>
          <p className="text-xs text-slate-500">No new notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isUnread = !n.readAt;

            return (
              <div
                key={n.id}
                onClick={() => isUnread && handleMarkRead(n.id)}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  isUnread
                    ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {n.body}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-lg shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
