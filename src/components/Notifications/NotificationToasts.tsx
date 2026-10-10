import React from 'react';
import {
  Bell,
  CheckCircle,
  Gift,
  MessageSquare,
  Phone,
  UserPlus,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationToasts: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 rtl:left-4 rtl:right-auto z-70 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        const getIcon = () => {
          switch (notif.type) {
            case 'message':
              return <MessageSquare className="w-5 h-5 text-[#5865f2]" />;
            case 'friend_request':
            case 'friend_accepted':
              return <UserPlus className="w-5 h-5 text-[#23a55a]" />;
            case 'coin_gift':
              return <Gift className="w-5 h-5 text-amber-400" />;
            case 'call':
              return <Phone className="w-5 h-5 text-sky-400" />;
            default:
              return <Bell className="w-5 h-5 text-[#5865f2]" />;
          }
        };

        return (
          <div
            key={notif.id}
            onClick={() => {
              if (notif.onClick) notif.onClick();
              dismissNotification(notif.id);
            }}
            className="pointer-events-auto p-3.5 bg-[#1e1f22]/95 backdrop-blur-md border border-[#2b2d31] rounded-2xl shadow-2xl flex items-start gap-3 cursor-pointer hover:border-[#5865f2] transition-all animate-in slide-in-from-top-4 fade-in duration-200"
          >
            {/* Avatar or Icon */}
            {notif.avatar ? (
              <img
                src={notif.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2b2d31] flex items-center justify-center shrink-0">
                {getIcon()}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">
                  {notif.title}
                </span>
                <span className="text-[10px] text-[#949ba4]">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-[#dbdee1] mt-0.5 line-clamp-2 leading-snug">
                {notif.body}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notif.id);
              }}
              className="text-[#949ba4] hover:text-white p-1 rounded-md shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
