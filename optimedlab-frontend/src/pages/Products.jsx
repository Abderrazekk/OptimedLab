import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import ProductForm from "../components/products/ProductForm";
import ProductDetailModal from "../components/products/ProductDetailModal";
import { formatPrice } from "../utils/formatPrice";

const Products = () => {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const supplierIdFilter = searchParams.get("supplierId");

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const serverUrl = apiUrl?.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

  const canEdit = user && (user.role === "admin" || user.role === "stock");
  const canView =
    user &&
    (user.role === "admin" ||
      user.role === "stock" ||
      user.role === "commercial" ||
      user.role === "director");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (supplierIdFilter) {
      result = result.filter((p) => p.supplier?._id === supplierIdFilter);
    }
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.supplier?.name &&
            p.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }
    setFiltered(result);
  }, [searchTerm, products, supplierIdFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete product ${name}?`))
      return;
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct._id, data);
      } else {
        await productService.createProduct(data);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleCardClick = (product) => {
    setDetailProduct(product);
  };

  const clearSupplierFilter = () => {
    searchParams.delete("supplierId");
    setSearchParams(searchParams);
  };

  const activeSupplierName =
    supplierIdFilter && products.length > 0
      ? products.find((p) => p.supplier?._id === supplierIdFilter)?.supplier
          ?.name
      : null;

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
              You don't have permission to view products.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.threshold,
  ).length;

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
              Product Management
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Products
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your product catalog and inventory
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
              Showing
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {filtered.length}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              In Stock
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {products.filter((p) => p.stockQuantity > 0).length}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Low Stock
            </div>
            <div
              className={`text-2xl font-bold -tracking-[0.03em] ${lowStockCount > 0 ? "text-red-600" : "text-emerald-900"}`}
            >
              {lowStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10 pt-6">
        {/* Supplier filter badge */}
        {supplierIdFilter && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <svg
                className="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>
                Showing products supplied by:{" "}
                <strong className="font-bold">
                  {activeSupplierName || "Loading..."}
                </strong>
              </span>
            </div>
            <button
              onClick={clearSupplierFilter}
              className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Controls bar */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-55 max-w-90 flex-1">
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
              placeholder="Search by name, category, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500">
            <strong className="text-emerald-900">{filtered.length}</strong>
            {filtered.length === 1 ? "product" : "products"}
          </div>

          {canEdit && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:translate-y-0.5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Product
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
            <span className="text-sm text-gray-400">Loading products…</span>
          </div>
        ) : filtered.length === 0 ? (
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
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {searchTerm || supplierIdFilter
                ? "No matching products"
                : "No products yet"}
            </div>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              {searchTerm || supplierIdFilter
                ? "Try adjusting your search or filter."
                : "Add your first product to start building your catalog."}
            </p>
            {canEdit && !searchTerm && !supplierIdFilter && (
              <button
                onClick={handleAdd}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add First Product
              </button>
            )}
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <div
                key={p._id}
                onClick={() => handleCardClick(p)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                {/* Top accent bar on hover */}
                <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-emerald-600 to-emerald-300 opacity-0 transition-opacity group-hover:opacity-100"></div>

                {/* Image */}
                <div className="relative h-48 bg-gray-50 overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={`${serverUrl}/${p.images[0]}`}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <svg
                        className="h-12 w-12 text-gray-300"
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

                {/* Body */}
                <div className="flex-1 p-5">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    {p.category}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(p.price)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${
                        p.stockQuantity <= p.threshold
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      Stock: {p.stockQuantity}
                    </span>
                  </div>

                  {/* Actions on hover */}
                  {canEdit && (
                    <div className="mt-4 flex justify-end gap-2 border-t border-gray-50 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => handleEdit(p, e)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
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
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(p._id, p.name, e)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
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

export default Products;
