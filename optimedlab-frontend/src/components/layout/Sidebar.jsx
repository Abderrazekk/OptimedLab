// src/components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import logoImage from "../../assets/optimedlab_logo.png";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClasses = (path) => {
    const active = isActive(path);
    return `group flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
      active
        ? "text-emerald-700 bg-emerald-50/80"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;
  };

  const activeIndicator = (path) => {
    return isActive(path) ? (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r-md"></div>
    ) : null;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 transform bg-white border-r border-slate-200 w-64 z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-20 border-b border-slate-100 px-6">
          <Link
            to="/dashboard"
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <img
              src={logoImage}
              alt="OptimedLab"
              className="h-14 w-auto object-contain"
              onError={(e) => {
                // Fallback to text if image still fails
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "block";
              }}
            />
            <span className="text-2xl font-extrabold tracking-tight bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden">
              OptimedLab
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          <Link
            to="/dashboard"
            className={linkClasses("/dashboard")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {activeIndicator("/dashboard")}
            <svg
              className={`h-5 w-5 mr-3 transition-colors ${isActive("/dashboard") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/users"
              className={linkClasses("/users")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {activeIndicator("/users")}
              <svg
                className={`h-5 w-5 mr-3 transition-colors ${isActive("/users") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Users
            </Link>
          )}

          {user?.role !== "stock" && (
            <Link
              to="/clients"
              className={linkClasses("/clients")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {activeIndicator("/clients")}
              <svg
                className={`h-5 w-5 mr-3 transition-colors ${isActive("/clients") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Clients
            </Link>
          )}

          {(user?.role === "admin" ||
            user?.role === "stock" ||
            user?.role === "director") && (
            <Link
              to="/suppliers"
              className={linkClasses("/suppliers")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {activeIndicator("/suppliers")}
              <svg
                className={`h-5 w-5 mr-3 transition-colors ${isActive("/suppliers") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Suppliers
            </Link>
          )}

          <Link
            to="/products"
            className={linkClasses("/products")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {activeIndicator("/products")}
            <svg
              className={`h-5 w-5 mr-3 transition-colors ${isActive("/products") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Products
          </Link>

          <Link
            to="/stock"
            className={linkClasses("/stock")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {activeIndicator("/stock")}
            <svg
              className={`h-5 w-5 mr-3 transition-colors ${isActive("/stock") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            Stock
          </Link>

          <Link
            to="/stock/movements"
            className={linkClasses("/stock/movements")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {activeIndicator("/stock/movements")}
            <svg
              className={`h-5 w-5 mr-3 transition-colors ${isActive("/stock/movements") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            Movements
          </Link>

          {(user?.role === "admin" ||
            user?.role === "stock" ||
            user?.role === "director") && (
            <Link
              to="/purchase-orders"
              className={linkClasses("/purchase-orders")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {activeIndicator("/purchase-orders")}
              <svg
                className={`h-5 w-5 mr-3 transition-colors ${isActive("/purchase-orders") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Purchase Orders
            </Link>
          )}

          {(user?.role === "commercial" ||
            user?.role === "director" ||
            user?.role === "admin") && (
            <Link
              to="/quotes"
              className={linkClasses("/quotes")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {activeIndicator("/quotes")}
              <svg
                className={`h-5 w-5 mr-3 transition-colors ${isActive("/quotes") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Quotes
            </Link>
          )}

          {(user?.role === "admin" ||
            user?.role === "commercial" ||
            user?.role === "director") && (
            <Link
              to="/invoices"
              className={linkClasses("/invoices")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {activeIndicator("/invoices")}
              <svg
                className={`h-5 w-5 mr-3 transition-colors ${isActive("/invoices") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Invoices
            </Link>
          )}

          <Link
            to="/calendar"
            className={linkClasses("/calendar")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {activeIndicator("/calendar")}
            <svg
              className="mr-3 h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Agenda / Visites
          </Link>

          <Link
            to="/reports"
            className={linkClasses("/reports")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {activeIndicator("/reports")}
            <svg
              className={`h-5 w-5 mr-3 transition-colors ${isActive("/reports") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Reports
          </Link>
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <Link
            to="/profile"
            className="flex items-center p-2 -mx-2 rounded-xl hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all duration-200"
          >
            <div className="shrink-0">
              {user?.avatar ? (
                <img
                  src={`http://localhost:5000${user.avatar}`}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {user?.name}
              </p>
              <p className="text-xs font-medium text-slate-500 capitalize truncate">
                {user?.role}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
