// src/pages/Stock.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import stockService from "../services/stockService";
import AdjustStockForm from "../components/stock/AdjustStockForm";
import ProductDetailModal from "../components/products/ProductDetailModal";
import QRScannerModal from "../components/stock/QRScannerModal";

const Stock = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States for our Modals and Views
  const [detailProduct, setDetailProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

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

  const handleScanSuccess = (scannedId) => {
    setShowScanner(false);
    const foundProduct = products.find((p) => p._id === scannedId);
    if (foundProduct) {
      setAdjustProduct(foundProduct);
    } else {
      alert("Product not found in the current stock list.");
    }
  };

  // Extract unique aisles for the Digital Twin map
  const aisles = useMemo(() => {
    const allAisles = products
      .filter((p) => p.shelfLocation && p.shelfLocation.aisle)
      .map((p) => p.shelfLocation.aisle.toUpperCase());
    return [...new Set(allAisles)].sort();
  }, [products]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      {/* Header and Controls */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Warehouse Inventory
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor current stock levels, adjust quantities, or view the
            physical layout.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* View Toggle Buttons */}
          <div className="bg-white border border-gray-300 rounded-md shadow-sm inline-flex p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium rounded-sm flex items-center transition-colors ${viewMode === "list" ? "bg-slate-800 text-white shadow" : "text-gray-500 hover:text-gray-900"}`}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                ></path>
              </svg>
              List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 text-sm font-medium rounded-sm flex items-center transition-colors ${viewMode === "map" ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-900"}`}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                ></path>
              </svg>
              2D Map View
            </button>
          </div>

          {canAdjust && (
            <button
              onClick={() => setShowScanner(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm14 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM3 16a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm14 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z"
                />
              </svg>
              Scan QR
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : viewMode === "list" ? (
        /* ---------------- ORIGINAL LIST VIEW ---------------- */
        <div className="flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Stock Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {canAdjust && (
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-12 w-12 shrink-0">
                                {p.images && p.images.length > 0 ? (
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                    src={getImageUrl(p.images[0])}
                                    alt={p.name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <span className="text-gray-400 text-xs">
                                      No img
                                    </span>
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
                            <div className="text-sm text-gray-900 font-medium">
                              {p.shelfLocation?.aisle
                                ? `Aisle ${p.shelfLocation.aisle}`
                                : "Unassigned"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.shelfLocation?.binCode
                                ? `Bin ${p.shelfLocation.binCode}`
                                : ""}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900 font-bold">
                              {p.stockQuantity} Units
                            </div>
                            <div className="text-xs text-gray-500">
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
                          {canAdjust && (
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAdjustProduct(p);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Adjust
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------- NEW DIGITAL TWIN MAP VIEW ---------------- */
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-slate-200 relative">
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                ></path>
              </svg>
              Live Map Legend
            </h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm font-medium text-slate-600">
                <div className="w-5 h-5 bg-green-500 rounded border border-green-600 mr-2 shadow-sm"></div>{" "}
                Optimal Stock
              </div>
              <div className="flex items-center text-sm font-medium text-slate-600">
                <div className="w-5 h-5 bg-yellow-400 rounded border border-yellow-500 mr-2 shadow-sm"></div>{" "}
                Low Warning
              </div>
              <div className="flex items-center text-sm font-medium text-slate-600">
                <div className="w-5 h-5 bg-red-500 rounded border border-red-600 mr-2 shadow-sm animate-pulse"></div>{" "}
                Out of Stock
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {aisles.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                <p className="mt-4 text-slate-500 font-medium">
                  No products have been assigned physical locations yet.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Edit products to assign an Aisle and Bin Code.
                </p>
              </div>
            )}

            {aisles.map((aisle) => (
              <div
                key={aisle}
                className="bg-slate-50 border-2 border-slate-300 rounded-xl p-6 shadow-sm relative group"
              >
                <div className="flex justify-between items-center mb-6 border-b-2 border-slate-200 pb-3">
                  <h3 className="text-3xl font-black text-slate-800">
                    Aisle {aisle}
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 border border-indigo-200 rounded-full shadow-sm">
                    Storage Zone
                  </span>
                </div>

                {/* Render Bins inside this Aisle */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {products
                    .filter(
                      (p) => p.shelfLocation?.aisle?.toUpperCase() === aisle,
                    )
                    .sort(
                      (a, b) =>
                        (a.shelfLocation.shelfNumber || 0) -
                        (b.shelfLocation.shelfNumber || 0),
                    )
                    .map((p) => {
                      const status = getStockStatus(p);
                      const mapColor =
                        status === "out"
                          ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] border-red-700"
                          : status === "low"
                            ? "bg-yellow-400 border-yellow-600"
                            : "bg-green-500 border-green-700";

                      return (
                        <div
                          key={p._id}
                          onClick={() => setDetailProduct(p)}
                          title={`${p.name}\nStock: ${p.stockQuantity} \nBin: ${p.shelfLocation.binCode}`}
                          className={`
                            aspect-square rounded-md cursor-pointer border-b-4
                            hover:scale-110 hover:z-10 transition-all duration-200 relative
                            ${mapColor} flex flex-col items-center justify-center shadow-md
                          `}
                        >
                          <span className="text-white text-[10px] font-extrabold bg-black/40 px-1 rounded-sm">
                            {p.shelfLocation.binCode || "-"}
                          </span>
                        </div>
                      );
                    })}
                </div>
                {/* Floor graphic */}
                <div className="mt-6 w-full h-3 bg-linear-to-r from-slate-300 to-slate-400 rounded-full opacity-50"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {adjustProduct && (
        <AdjustStockForm
          product={adjustProduct}
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
