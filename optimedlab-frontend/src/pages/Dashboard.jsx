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
      .slice(0, 5);
  }, [invoices]);

  const quickStats = {
    revenue: stats?.totalSales || 0,
    sales: stats?.totalInvoices || 0,
    products: stats?.totalProducts || 0,
    clients: stats?.totalClients || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-8 pb-16 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15)_0%,transparent_60%)]"></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(5,150,105,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute -right-15 -top-15 h-75 w-75 rounded-full border border-white/5"></div>

        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-emerald-300">
              Business Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Welcome back,{" "}
            <span className="font-semibold text-white/90">{user?.name}</span>
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Revenue
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {formatPrice(quickStats.revenue)}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Sales
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {quickStats.sales}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Products
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {quickStats.products}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Clients
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {quickStats.clients}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10 pt-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode("analytics")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                viewMode === "analytics"
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                viewMode === "map"
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Clients Map
            </button>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-white p-4">
            <svg
              className="h-5 w-5 shrink-0 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-red-900">
                Something went wrong
              </div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {viewMode === "map" ? (
          <ClientsMap />
        ) : loading ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
            <span className="text-sm text-gray-400">Loading dashboard…</span>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* --- OPTIMIZED PAYMENT DUE ALERTS --- */}
            <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Payment Due Alerts
                  </h3>
                </div>
                <Link
                  to="/invoices"
                  className="text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
                >
                  View all →
                </Link>
              </div>

              {loadingInvoices ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500"></div>
                </div>
              ) : urgentInvoices.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/30 py-8 transition-all duration-300 hover:bg-emerald-50/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/50 text-emerald-500">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">
                    All clear!
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    No overdue or urgent invoices.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {urgentInvoices.map((inv) => {
                    const daysLeft = getDaysRemaining(inv.dueDate);
                    const overdue = isOverdue(inv.dueDate);
                    return (
                      <div
                        key={inv._id}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                          overdue
                            ? "border-red-100 hover:border-red-300 hover:ring-1 hover:ring-red-200"
                            : "border-amber-100 hover:border-amber-300 hover:ring-1 hover:ring-amber-200"
                        }`}
                      >
                        {/* Background soft gradient based on status */}
                        <div
                          className={`absolute inset-0 opacity-[0.07] pointer-events-none ${overdue ? "bg-linear-to-br from-red-500 to-transparent" : "bg-linear-to-br from-amber-500 to-transparent"}`}
                        />

                        <div className="relative z-10 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
                              {inv.invoiceNumber}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-gray-500">
                              {inv.client?.name}
                            </p>
                          </div>
                          <span
                            className={`flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset ${
                              overdue
                                ? "bg-red-50 text-red-600 ring-red-500/20"
                                : "bg-amber-50 text-amber-600 ring-amber-500/20"
                            }`}
                          >
                            {overdue ? "OVERDUE" : `${daysLeft} days left`}
                          </span>
                        </div>
                        <div className="relative z-10 mt-4 flex items-end justify-between border-t border-gray-50 pt-4">
                          <div className="flex flex-col">
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">
                              Due Date
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                              {formatDate(inv.dueDate)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600">
                              Amount
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatPrice(inv.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Revenue Trend
                </h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Active
                </span>
              </div>
              <SalesChart data={stats.salesByDate} />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Stock Movements
                </h2>
              </div>
              <StockMovementChart />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <TopProducts products={stats.topProducts} />
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <TopClients clients={stats.topClients} />
              </div>
            </div>

            {/* --- UPDATED STOCK ALERTS WRAPPER --- */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <AlertsWidget />
            </div>

            {user?.role === "director" && stats.averageInvoiceValue && (
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-900 to-emerald-800 p-8 shadow-xl">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
                  <svg
                    className="h-6 w-6 text-amber-400"
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
                <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-md transition hover:bg-white/20">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-300">
                      Avg. Invoice Value
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-white">
                      {formatPrice(stats.averageInvoiceValue)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/20 p-6 backdrop-blur-md transition hover:bg-red-500/30">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wider text-red-200">
                      Unpaid Invoices
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-red-400">
                      {formatPrice(stats.unpaidInvoices)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-white p-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-600">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              No data available
            </div>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              No analytical data for this period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
