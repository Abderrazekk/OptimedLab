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
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="flex justify-between items-center px-6 lg:px-8 py-3">
            {/* Left side (empty, could hold breadcrumbs) */}
            <div className="flex-1" />

            {/* Right side: notifications + user info + logout */}
            <div className="flex items-center gap-4">
              <NotificationBell />

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200" />

              {/* User avatar & greeting */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-gray-500">
                      Welcome back,
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name}
                    </p>
                  </div>
                </div>

                {/* Logout button + confirmation popup */}
                <div className="relative ml-2" ref={confirmRef}>
                  <button
                    onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    <svg
                      className="h-4 w-4"
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
                    <span className="hidden sm:inline">Logout</span>
                  </button>

                  {/* Logout confirmation popup */}
                  {showLogoutConfirm && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-5 shadow-lg border border-gray-100 animate-rise z-30">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                          <svg
                            className="w-6 h-6"
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
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                          Confirmer la déconnexion
                        </h4>
                        <p className="text-xs text-gray-500">
                          Êtes-vous sûr de vouloir vous déconnecter ?
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleLogoutCancel}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleLogoutConfirm}
                          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default Layout;
