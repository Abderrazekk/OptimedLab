// src/pages/Stock.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import stockService from "../services/stockService";
import AdjustStockForm from "../components/stock/AdjustStockForm";
import ProductDetailModal from "../components/products/ProductDetailModal";

const Stock = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States for our Modals
  const [detailProduct, setDetailProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null); // Track WHICH product to adjust

  const canAdjust = user && (user.role === "admin" || user.role === "stock");

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await stockService.getStockList();
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stock");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product) => {
    if (product.stockQuantity <= 0) return "out";
    if (product.stockQuantity <= product.threshold) return "low";
    return "normal";
  };

  const statusColors = {
    out: "bg-red-100 text-red-800 border-red-200",
    low: "bg-yellow-100 text-yellow-800 border-yellow-200",
    normal: "bg-green-100 text-green-800 border-green-200",
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor current stock levels, view status alerts, and perform manual
            adjustments.
          </p>
        </div>
        {/* The top button has been removed from here! */}
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.78 7.5a.75.75 0 011.5 0v2.5a.75.75 0 01-1.5 0v-2.5zm.72 4.5a1 1 0 110-2 1 1 0 010 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        Product Details
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        Stock Info
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        Supplier
                      </th>
                      {/* Added Actions Column Header */}
                      {canAdjust && (
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.map((p) => {
                      const status = getStockStatus(p);
                      return (
                        <tr
                          key={p._id}
                          onClick={() => setDetailProduct(p)}
                          className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-12 w-12 shrink-0">
                                {p.images && p.images.length > 0 ? (
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                                    src={getImageUrl(p.images[0])}
                                    alt={p.name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
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
                                  {p.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  SKU: {p.sku || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {p.category}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {p.stockQuantity} Units
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Threshold: {p.threshold}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${statusColors[status]}`}
                            >
                              {status === "out"
                                ? "Out of Stock"
                                : status === "low"
                                  ? "Low Stock"
                                  : "Normal"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 font-medium">
                            {p.supplier?.name || "—"}
                          </td>

                          {/* Added Actions Column Body with Adjust Button */}
                          {canAdjust && (
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents row click (Detail Modal) from firing
                                  setAdjustProduct(p); // Opens Adjust Modal for this product
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <svg
                                  className="-ml-0.5 mr-2 h-4 w-4 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                Adjust
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr>
                        <td
                          colSpan={canAdjust ? "6" : "5"}
                          className="px-6 py-12 text-center text-gray-500 bg-gray-50"
                        >
                          <p>No products found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Adjust Stock Form for a specific product */}
      {adjustProduct && (
        <AdjustStockForm
          product={adjustProduct} // Pass the product down!
          onSubmit={async (data) => {
            try {
              await stockService.adjustStock(data);
              setAdjustProduct(null);
              fetchStock();
            } catch (err) {
              alert(err.response?.data?.message || "Adjustment failed");
            }
          }}
          onClose={() => setAdjustProduct(null)}
        />
      )}

      {/* Render Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}
    </div>
  );
};

export default Stock;
