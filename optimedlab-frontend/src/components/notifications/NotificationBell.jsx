import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "stock_alert":
      case "stock_critical":
        return "⚠️";
      case "quote_created":
      case "quote_validated":
        return "📄";
      case "invoice_created":
      case "invoice_paid":
        return "💰";
      case "po_created":
      case "po_received":
        return "📦";
      case "visit_scheduled":
        return "📅";
      case "client_added":
        return "👤";
      case "user_created":
      case "user_role_changed":
      case "user_banned":
        return "🔐";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-128 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                Aucune notification
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition ${
                    !notif.read ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getIconForType(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif._id);
                          }}
                          className="text-slate-400 hover:text-red-500 ml-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-slate-200 text-center">
            <button
              onClick={() => {
                fetchNotifications();
                setIsOpen(false);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;