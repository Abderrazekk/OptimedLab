// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import biService from "../services/biService";
import invoiceService from "../services/invoiceService";
import SalesChart from "../components/dashboard/SalesChart";
import TopProducts from "../components/dashboard/TopProducts";
import TopClients from "../components/dashboard/TopClients";
import StatsCard from "../components/dashboard/StatsCard";
import AlertsWidget from "../components/stock/AlertsWidget";
import StockMovementChart from "../components/dashboard/StockMovementChart";
import ClientsMap from "../components/dashboard/ClientsMap";
import { formatPrice } from "../utils/formatPrice";
import { formatDate, getDaysRemaining, isOverdue } from "../utils/dateHelpers";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [viewMode, setViewMode] = useState("analytics");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    // Fetch invoices for payment alerts if user is commercial or director
    if (
      user &&
      (user.role === "commercial" ||
        user.role === "director" ||
        user.role === "admin")
    ) {
      fetchInvoices();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await biService.getDashboardStats(period);
      setStats(response.data);
    } catch (err) {
      setError("Failed to load dashboard stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await invoiceService.getInvoices();
      setInvoices(response.data);
    } catch (err) {
      console.error("Failed to load invoices for alerts", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Filter urgent invoices (unpaid and due within 7 days or overdue)
  const urgentInvoices = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return invoices
      .filter((inv) => inv.paymentStatus === "unpaid" && inv.dueDate)
      .filter((inv) => {
        const due = new Date(inv.dueDate);
        return due <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5); // Limit to 5 most urgent
  }, [invoices]);

  return (
    <div className="py-8 px-4 sm:px-8 container mx-auto max-w-7xl font-sans">
      {/* PREMIUM HEADER SECTION */}
      <div className="relative bg-white rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row justify-between items-center overflow-hidden gap-6">
        {/* Decorative blur elements for modern glass effect */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -ml-20 -mt-20 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -mr-20 -mb-20 z-0 pointer-events-none"></div>

        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-900 to-indigo-600 tracking-tight">
            Overview
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Welcome back,{" "}
            <span className="text-indigo-600 font-semibold">{user?.name}</span>
          </p>
        </div>

        {/* MODERN SEGMENTED CONTROL TOGGLE */}
        <div className="relative z-10 bg-gray-100/80 backdrop-blur-md p-1.5 rounded-2xl inline-flex w-full md:w-auto border border-gray-200/50 shadow-inner">
          <button
            onClick={() => setViewMode("analytics")}
            className={`relative flex-1 md:flex-none px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 z-10 ${
              viewMode === "analytics"
                ? "text-indigo-700 shadow-md bg-white"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analytics
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`relative flex-1 md:flex-none px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 z-10 ${
              viewMode === "map"
                ? "text-indigo-700 shadow-md bg-white"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Clients Map
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 shadow-sm font-medium">
          {error}
        </div>
      )}

      {/* VIEW RENDERER WITH SOFT FADE ANIMATION */}
      <div className="transition-all duration-500 ease-in-out">
        {viewMode === "map" ? (
          <div className="animate-fade-in-up">
            <ClientsMap />
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : stats ? (
              <div className="space-y-8">
                {/* Custom Period Selector */}
                <div className="flex justify-end">
                  <div className="relative inline-block w-48">
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="block w-full appearance-none bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 pr-8 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-shadow"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Total Revenue"
                    value={formatPrice(stats.totalRevenue)}
                    type="revenue"
                  />
                  <StatsCard
                    title="Total Sales"
                    value={stats.totalSalesCount}
                    type="sales"
                  />
                  <StatsCard
                    title="Total Products"
                    value={stats.totalProducts}
                    type="products"
                  />
                  <StatsCard
                    title="Active Clients"
                    value={stats.totalClients}
                    type="clients"
                  />
                </div>

                {/* Invoice Payment Alerts (New Section) */}
                {!loadingInvoices && urgentInvoices.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Payment Due Alerts
                      </h2>
                      <Link
                        to="/invoices"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View all invoices →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {urgentInvoices.map((inv) => {
                        const daysLeft = getDaysRemaining(inv.dueDate);
                        const overdue = isOverdue(inv.dueDate);
                        return (
                          <div
                            key={inv._id}
                            className={`p-4 rounded-xl border ${
                              overdue
                                ? "border-red-200 bg-red-50"
                                : "border-amber-200 bg-amber-50"
                            } flex flex-col`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {inv.invoiceNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {inv.client?.name}
                                </p>
                              </div>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  overdue
                                    ? "bg-red-200 text-red-800"
                                    : "bg-amber-200 text-amber-800"
                                }`}
                              >
                                {overdue ? "OVERDUE" : `${daysLeft} days left`}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Due: {formatDate(inv.dueDate)}
                              </span>
                              <span className="font-bold text-gray-900">
                                {formatPrice(inv.total)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main Charts */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Revenue Trend
                    </h2>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <SalesChart data={stats.salesByDate} />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Stock Movements
                    </h2>
                  </div>
                  <StockMovementChart />
                </div>

                {/* Two Column Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <TopProducts products={stats.topProducts} />
                  </div>
                  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <TopClients clients={stats.topClients} />
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
                  <AlertsWidget />
                </div>

                {/* Executive Section */}
                {user?.role === "director" && stats.averageInvoiceValue && (
                  <div className="bg-linear-to-br from-gray-900 to-indigo-900 p-8 rounded-3xl shadow-xl border border-gray-800 relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Executive Insights
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                        <p className="text-sm text-gray-300 font-medium mb-2 uppercase tracking-wider">
                          Avg. Invoice Value
                        </p>
                        <p className="text-3xl font-bold text-white tracking-tight">
                          {formatPrice(stats.averageInvoiceValue)}
                        </p>
                      </div>
                      <div className="bg-red-500/20 backdrop-blur-md p-6 rounded-2xl border border-red-500/20 hover:bg-red-500/30 transition-colors">
                        <p className="text-sm text-red-200 font-medium mb-2 uppercase tracking-wider">
                          Unpaid Invoices
                        </p>
                        <p className="text-3xl font-bold text-red-400 tracking-tight">
                          {formatPrice(stats.unpaidInvoices)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 border-dashed">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-500 font-medium">
                  No analytical data available for this period.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
