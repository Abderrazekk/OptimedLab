// src/pages/Products.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import ProductForm from "../components/products/ProductForm";
import ProductDetailModal from "../components/products/ProductDetailModal";
import { formatPrice } from "../utils/formatPrice";

const Products = () => {
  const { user } = useAuth();

  // URL Params State
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

  // Update Filtering Logic to include both Text Search AND URL Parameters
  useEffect(() => {
    let result = products;

    // 1. Filter by Supplier ID from URL (if it exists)
    if (supplierIdFilter) {
      result = result.filter((p) => p.supplier?._id === supplierIdFilter);
    }

    // 2. Filter by search term text
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

  // Extract supplier name for the UI badge when filtered
  const activeSupplierName =
    supplierIdFilter && products.length > 0
      ? products.find((p) => p.supplier?._id === supplierIdFilter)?.supplier
          ?.name
      : null;

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your product catalog
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Product
          </button>
        )}
      </div>

      {/* FILTER BADGE: Shows up only if coming from a specific Supplier card */}
      {supplierIdFilter && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50/50 text-blue-700 px-4 py-3 rounded-lg border border-blue-100 shadow-sm gap-3">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-500"
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
            <span className="text-sm font-medium">
              Showing products supplied by:{" "}
              <strong className="font-bold">
                {activeSupplierName || "Loading..."}
              </strong>
            </span>
          </div>
          <button
            onClick={clearSupplierFilter}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-md border border-blue-200 shadow-sm transition-colors whitespace-nowrap focus:outline-none"
          >
            View All Products
          </button>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products by name, category, or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
              No products found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleCardClick(p)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="h-48 bg-gray-50 relative overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={`${serverUrl}/${p.images[0]}`}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12 text-gray-300"
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
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{p.category}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(p.price)}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stockQuantity <= p.threshold ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                      >
                        Stock: {p.stockQuantity}
                      </span>
                    </div>
                    {canEdit && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEdit(p, e)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(p._id, p.name, e)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium focus:outline-none"
                        >
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
      )}

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
