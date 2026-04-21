// src/components/layout/Layout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import ChatbotWidget from "../chatbot/ChatbotWidget";
import NotificationBell from "../notifications/NotificationBell";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const confirmRef = useRef(null);

  // Close confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (confirmRef.current && !confirmRef.current.contains(event.target)) {
        setShowLogoutConfirm(false);
      }
    };
    if (showLogoutConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogoutConfirm]);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 to-slate-100 font-sans text-slate-800 antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - Enhanced */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm sticky top-0 z-20">
          <div className="flex justify-between items-center px-6 lg:px-8 py-3">
            {/* Left side - could be breadcrumbs or page title (optional) */}
            <div className="flex-1" />

            {/* Right side - User actions */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Profile Section */}
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-slate-500">
                    Welcome back,
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {user?.name}
                  </span>
                </div>
              </div>

              {/* Logout Button with Confirmation */}
              <div className="relative" ref={confirmRef}>
                <button
                  onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200 rounded-xl shadow-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>

                {/* Logout Confirmation Popup */}
                {showLogoutConfirm && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-30">
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">
                        Confirmer la déconnexion
                      </h4>
                      <p className="text-xs text-slate-500">
                        Êtes-vous sûr de vouloir vous déconnecter ?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLogoutCancel}
                        className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleLogoutConfirm}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Enhanced with subtle background pattern */}
        <main className="flex-1 overflow-auto bg-slate-50/30 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default Layout;