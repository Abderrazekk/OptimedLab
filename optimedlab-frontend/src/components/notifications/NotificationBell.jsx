
import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
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

  const getBadgeColor = (type) => {
    if (type.includes("stock")) return "bg-amber-100 text-amber-800";
    if (type.includes("quote") || type.includes("invoice"))
      return "bg-blue-100 text-blue-800";
    if (type.includes("po")) return "bg-purple-100 text-purple-800";
    if (type.includes("visit")) return "bg-pink-100 text-pink-800";
    if (type.includes("client")) return "bg-emerald-100 text-emerald-800";
    if (type.includes("user")) return "bg-gray-100 text-gray-800";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-emerald-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-full"
        aria-label="Notifications"
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
          <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-semibold text-white bg-emerald-500 rounded-full ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-xl border border-slate-200/80 z-50 max-h-128 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 text-base">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">
                  Aucune notification
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Vous êtes à jour !
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`group relative px-5 py-4 hover:bg-slate-50/80 cursor-pointer transition-all ${
                    !notif.read
                      ? "bg-emerald-50/30 border-l-4 border-l-emerald-500"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getBadgeColor(
                        notif.type,
                      )}`}
                    >
                      {getIconForType(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif._id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                            aria-label="Supprimer"
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
                          {!notif.read && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5 flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
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

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50">
            <button
              onClick={() => {
                fetchNotifications();
                setIsOpen(false);
              }}
              className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
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
