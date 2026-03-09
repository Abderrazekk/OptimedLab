// src/components/layout/Layout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import ChatbotWidget from '../chatbot/ChatbotWidget';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 sticky top-0">
          <div className="flex justify-end items-center px-8 py-4">
            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-3 border-r border-slate-200 pr-5">
                <span className="text-sm text-slate-500">
                  Welcome back,{" "}
                  <span className="font-semibold text-slate-800">
                    {user?.name}
                  </span>
                </span>
                <span className="px-3 py-1 text-[11px] font-semibold tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full uppercase">
                  {user?.role === "commercial"
                    ? "Commercial"
                    : user?.role === "stock"
                      ? "Stock"
                      : user?.role === "director"
                        ? "Director"
                        : "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
};

export default Layout;
