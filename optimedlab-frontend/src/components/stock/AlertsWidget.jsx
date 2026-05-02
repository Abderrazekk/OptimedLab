import React, { useState, useEffect } from "react";
import productService from "../../services/productService";
import { Link } from "react-router-dom";

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Fetch all products (or hit a specific /alerts endpoint if your API has one)
      const response = await productService.getProducts();

      // Handle standard API payload structures
      const allProducts =
        response.data?.data || response.data || response || [];

      if (Array.isArray(allProducts)) {
        // Filter out products that have hit their critical threshold
        const lowStockProducts = allProducts.filter(
          (p) => p.stockQuantity <= p.threshold,
        );

        // Sort to show 'Rupture' (0 stock) first, then the lowest remaining quantities
        lowStockProducts.sort((a, b) => a.stockQuantity - b.stockQuantity);

        // Take the top 5 most urgent alerts for the dashboard view
        setAlerts(lowStockProducts.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch stock alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Stock Alerts
          </h3>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-[0.7rem] font-bold text-orange-600 ring-1 ring-inset ring-orange-500/20">
          {alerts.length} Warnings
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/30 py-12 transition-all duration-300 hover:bg-emerald-50/50">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500">
            Stock is healthy!
          </p>
          <p className="mt-1 text-xs text-gray-400">
            All products are safely above their thresholds.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {alerts.map((item, i) => {
            const isRupture = item.stockQuantity <= 0;
            return (
              <li
                key={i}
                className={`group relative flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isRupture
                    ? "border-red-100 hover:border-red-300 hover:ring-1 hover:ring-red-200"
                    : "border-orange-100 hover:border-orange-300 hover:ring-1 hover:ring-orange-200"
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  {/* Status Icon Badge */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset ${
                      isRupture
                        ? "bg-red-50 text-red-600 ring-red-500/20"
                        : "bg-orange-50 text-orange-600 ring-orange-500/20"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>

                  {/* Product Details */}
                  <div className="truncate">
                    <p className="truncate text-sm font-bold text-gray-800 transition-colors group-hover:text-emerald-700">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-gray-400">
                      Threshold: {item.threshold} units
                    </p>
                  </div>
                </div>

                {/* Stock Remaining */}
                <div className="ml-4 flex shrink-0 flex-col items-end">
                  <span
                    className={`text-sm font-bold ${
                      isRupture ? "text-red-600" : "text-orange-600"
                    }`}
                  >
                    {item.stockQuantity} Left
                  </span>
                  <span className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">
                    {isRupture ? "Out of Stock" : "Low Stock"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {alerts.length > 0 && (
        <div className="mt-5 text-center">
          <Link
            to="/stock"
            className="text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
          >
            Manage Stock Details →
          </Link>
        </div>
      )}
    </div>
  );
};

export default AlertsWidget;
