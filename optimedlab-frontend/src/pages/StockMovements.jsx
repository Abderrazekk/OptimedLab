import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import stockService from "../services/stockService";
import StockMovementDetails from "../components/stock/StockMovementDetails";

const StockMovements = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await stockService.getMovements({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setMovements(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch movements");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  const filteredMovements = useMemo(() => {
    if (!searchTerm) return movements;
    return movements.filter(
      (m) =>
        m.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.note?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [movements, searchTerm]);

  const totalMovements = pagination.total || movements.length;
  const inCount = movements.filter((m) => m.type === "in").length;
  const outCount = movements.filter((m) => m.type === "out").length;

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
              Inventory Tracking
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Stock Movements History
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Track all incoming and outgoing stock adjustments.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total Movements
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {totalMovements}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Stock In
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {inCount}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Stock Out
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-red-600">
              {outCount}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Page
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {pagination.page}/{pagination.totalPages || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10 pt-6">
        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-55 flex-1 max-w-90">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search products or references..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters({ ...filters, type: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">All Movement Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </div>

        {/* Error */}
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

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
            <span className="text-sm text-gray-400">Loading movements…</span>
          </div>
        ) : filteredMovements.length === 0 ? (
          /* Empty state */
          <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-white p-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-600">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              No movements found
            </div>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          /* Table View styled as cards */
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden md:flex items-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              <div className="w-2/5">Product</div>
              <div className="w-1/6">Type</div>
              <div className="w-1/6">Quantity</div>
              <div className="w-1/6">Reference / Note</div>
              <div className="w-1/6">Date</div>
              <div className="w-1/6">User</div>
            </div>

            {filteredMovements.map((movement) => (
              <div
                key={movement._id}
                onClick={() => {
                  setSelectedMovement(movement);
                  setShowDetails(true);
                }}
                className="group flex flex-col md:flex-row md:items-center gap-2 md:gap-4 rounded-2xl border border-gray-100 bg-white p-4 cursor-pointer transition-all hover:translate-x-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5"
              >
                {/* Product */}
                <div className="md:w-2/5 flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                    {movement.product?.images &&
                    movement.product.images.length > 0 ? (
                      <img
                        className="h-full w-full object-cover rounded-xl border border-gray-100"
                        src={getImageUrl(movement.product.images[0])}
                        alt={movement.product.name}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {movement.product?.name || "Unknown Product"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      SKU: {movement.product?.sku || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="md:w-1/6">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      movement.type === "in"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {movement.type === "in" ? "Stock In (+)" : "Stock Out (-)"}
                  </span>
                </div>

                {/* Quantity */}
                <div className="md:w-1/6 font-bold text-sm text-gray-900">
                  {movement.type === "in" ? "+" : "-"}
                  {movement.quantity}
                </div>

                {/* Reference / Note */}
                <div className="md:w-1/6 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {movement.reference || "—"}
                  </div>
                  {movement.note && (
                    <div
                      className="text-xs text-gray-500 mt-0.5 truncate max-w-37.5"
                      title={movement.note}
                    >
                      {movement.note}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="md:w-1/6 text-sm text-gray-500">
                  {formatDate(movement.createdAt)}
                </div>

                {/* User */}
                <div className="md:w-1/6 text-sm text-gray-500">
                  {movement.user?.name || "Unknown User"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">
              Page {pagination.page} of {pagination.totalPages}{" "}
              <span className="text-gray-300">|</span> Total: {pagination.total}{" "}
              movements
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  pagination.page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-200 shadow-sm"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  pagination.page === pagination.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-200 shadow-sm"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && (
        <StockMovementDetails
          movement={selectedMovement}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default StockMovements;
