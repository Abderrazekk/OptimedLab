// src/pages/StockMovements.jsx
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

  // IMAGE URL HELPER
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  // Client-side search logic
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Stock Movements History
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track all incoming and outgoing stock adjustments.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search products or references..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filters.type}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value });
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Movement Types</option>
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  {/* RESTORED REFERENCE HEADER */}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Reference / Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr
                    key={movement._id}
                    onClick={() => {
                      setSelectedMovement(movement);
                      setShowDetails(true);
                    }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0">
                          {movement.product?.images &&
                          movement.product.images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                              src={getImageUrl(movement.product.images[0])}
                              alt={movement.product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
                              <svg
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {movement.product?.name || "Unknown Product"}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            SKU: {movement.product?.sku || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${movement.type === "in" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {movement.type === "in"
                          ? "Stock In (+)"
                          : "Stock Out (-)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      {movement.type === "in" ? "+" : "-"}
                      {movement.quantity}
                    </td>
                    {/* RESTORED REFERENCE DATA CELL */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {movement.reference || "—"}
                      </div>
                      {movement.note && (
                        <div
                          className="text-xs text-gray-500 mt-0.5 truncate max-w-xs"
                          title={movement.note}
                        >
                          {movement.note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(movement.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.user?.name || "Unknown User"}
                    </td>
                  </tr>
                ))}
                {filteredMovements.length === 0 && (
                  <tr>
                    {/* Updated colSpan from 5 to 6 to account for the new Reference column */}
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <p className="font-medium text-gray-900">
                        No movements found.
                      </p>
                      <p className="text-sm mt-1">
                        Try adjusting your filters or search terms.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700 font-medium">
                Page {pagination.page} of {pagination.totalPages}{" "}
                <span className="text-gray-400">|</span> Total:{" "}
                {pagination.total} movements
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    pagination.page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    pagination.page === pagination.totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
