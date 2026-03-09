// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import biService from "../services/biService";
import SalesChart from "../components/dashboard/SalesChart";
import TopProducts from "../components/dashboard/TopProducts";
import TopClients from "../components/dashboard/TopClients";
import StatsCard from "../components/dashboard/StatsCard";
import AlertsWidget from "../components/stock/AlertsWidget";
import StockMovementChart from "../components/dashboard/StockMovementChart";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Sales"
              value={formatCurrency(stats.totalSales)}
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="green"
            />
            <StatsCard
              title="Invoices"
              value={stats.totalInvoices}
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              color="blue"
            />
            <StatsCard
              title="Pending Quotes"
              value={stats.pendingQuotes}
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
              color="yellow"
            />
            <StatsCard
              title="Stock Alerts"
              value={stats.stockAlerts}
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              }
              color="red"
            />
          </div>

          {/* Sales Chart */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Sales Trend
            </h2>
            <SalesChart data={stats.salesByDate} />
          </div>

          {/* Stock Movement Chart */}
          <StockMovementChart />

          {/* Two column layout */}
          <div className="grid p-4 grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TopProducts products={stats.topProducts} />
            <TopClients clients={stats.topClients} />
          </div>

          {/* Alerts Widget */}
          <div className="mb-6">
            <AlertsWidget />
          </div>

          {/* Director-only extra stats */}
          {user?.role === "director" && stats.averageInvoiceValue && (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-700 mb-2">
                Executive Insights
              </h3>
              <p className="text-sm text-gray-600">
                Average Invoice Value:{" "}
                <span className="font-semibold">
                  {formatCurrency(stats.averageInvoiceValue)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Unpaid Invoices Total:{" "}
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats.unpaidInvoices)}
                </span>
              </p>
            </div>
          )}
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default Dashboard;
