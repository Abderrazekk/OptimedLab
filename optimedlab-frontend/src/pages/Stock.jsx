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

  const [detailProduct, setDetailProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"

  const canAdjust = user && (user.role === "admin" || user.role === "stock");
  const canView =
    user &&
    (user.role === "admin" ||
      user.role === "stock" ||
      user.role === "commercial" ||
      user.role === "director");

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
    out: "bg-red-50 text-red-700 border-red-200",
    low: "bg-amber-50 text-amber-700 border-amber-200",
    normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

  const aisles = useMemo(() => {
    const allAisles = products
      .filter((p) => p.shelfLocation && p.shelfLocation.aisle)
      .map((p) => p.shelfLocation.aisle.toUpperCase());
    return [...new Set(allAisles)].sort();
  }, [products]);

  const inStockCount = products.filter((p) => p.stockQuantity > 0).length;
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.threshold,
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;

  if (!user) return null;

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/80 p-8">
        <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-6 w-6 text-red-500"
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Access Denied
            </h3>
            <p className="text-sm text-gray-500">
              You don't have permission to view stock.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              Inventory Management
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Warehouse Inventory
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Monitor stock levels, adjust quantities, or view the physical
            layout.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total Products
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {products.length}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              In Stock
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {inStockCount}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Low Stock
            </div>
            <div
              className={`text-2xl font-bold -tracking-[0.03em] ${lowStockCount > 0 ? "text-amber-600" : "text-emerald-900"}`}
            >
              {lowStockCount}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Out of Stock
            </div>
            <div
              className={`text-2xl font-bold -tracking-[0.03em] ${outOfStockCount > 0 ? "text-red-600" : "text-emerald-900"}`}
            >
              {outOfStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10 pt-6">
        {/* Controls bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl border border-gray-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "list"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "map"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                2D Map View
              </button>
            </div>
          </div>

          {canAdjust && (
            <button
              onClick={() => setShowScanner(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:translate-y-0.5"
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
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm14 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM3 16a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm14 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z"
                />
              </svg>
              Scan QR
            </button>
          )}
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
            <span className="text-sm text-gray-400">Loading inventory…</span>
          </div>
        ) : viewMode === "list" ? (
          /* List View */
          <div>
            {products.length === 0 ? (
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
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  No products in stock
                </div>
                <p className="mt-1 max-w-xs text-sm text-gray-400">
                  Add products to your catalog to start tracking inventory.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((p) => {
                  const status = getStockStatus(p);
                  return (
                    <div
                      key={p._id}
                      onClick={() => setDetailProduct(p)}
                      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:translate-x-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5"
                    >
                      {/* Image */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {p.images && p.images.length > 0 ? (
                          <img
                            className="h-full w-full rounded-xl object-cover border border-gray-100"
                            src={getImageUrl(p.images[0])}
                            alt={p.name}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-gray-900">
                          {p.name}
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          SKU: {p.sku || "N/A"} &bull;{" "}
                          {p.shelfLocation?.aisle
                            ? `Aisle ${p.shelfLocation.aisle}`
                            : "Unassigned"}
                          {p.shelfLocation?.binCode &&
                            ` / Bin ${p.shelfLocation.binCode}`}
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="hidden text-right sm:block">
                        <div className="text-sm font-bold text-gray-900">
                          {p.stockQuantity} Units
                        </div>
                        <div className="text-xs text-gray-500">
                          Threshold: {p.threshold}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}
                      >
                        {status === "out"
                          ? "Out of Stock"
                          : status === "low"
                            ? "Low Stock"
                            : "Normal"}
                      </span>

                      {/* Adjust Button */}
                      {canAdjust && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustProduct(p);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Adjust
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* 2D Map View */
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
            {/* Legend */}
            <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-600">
                Live Map Legend
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <div className="h-5 w-5 rounded border border-emerald-600 bg-emerald-500 shadow-sm"></div>{" "}
                  Optimal Stock
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <div className="h-5 w-5 rounded border border-amber-500 bg-amber-400 shadow-sm"></div>{" "}
                  Low Warning
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <div className="h-5 w-5 animate-pulse rounded border border-red-600 bg-red-500 shadow-sm"></div>{" "}
                  Out of Stock
                </div>
              </div>
            </div>

            {/* Aisles Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {aisles.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <p className="mt-4 font-medium text-gray-500">
                    No products have been assigned physical locations yet.
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Edit products to assign an Aisle and Bin Code.
                  </p>
                </div>
              )}

              {aisles.map((aisle) => (
                <div
                  key={aisle}
                  className="group rounded-xl border-2 border-gray-200 bg-gray-50 p-6 shadow-sm"
                >
                  <div className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-3">
                    <h3 className="text-3xl font-black text-gray-800">
                      Aisle {aisle}
                    </h3>
                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600 shadow-sm">
                      Storage Zone
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
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
                            ? "bg-red-500 border-red-700 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                            : status === "low"
                              ? "bg-amber-400 border-amber-600"
                              : "bg-emerald-500 border-emerald-700";

                        return (
                          <div
                            key={p._id}
                            onClick={() => setDetailProduct(p)}
                            title={`${p.name}\nStock: ${p.stockQuantity} \nBin: ${p.shelfLocation.binCode}`}
                            className={`aspect-square cursor-pointer rounded-md border-b-4 transition-all duration-200 hover:z-10 hover:scale-110 ${mapColor} relative flex flex-col items-center justify-center shadow-md`}
                          >
                            <span className="rounded-sm bg-black/40 px-1 text-[10px] font-extrabold text-white">
                              {p.shelfLocation.binCode || "-"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="mt-6 h-3 w-full rounded-full bg-linear-to-r from-gray-300 to-gray-400 opacity-50"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
