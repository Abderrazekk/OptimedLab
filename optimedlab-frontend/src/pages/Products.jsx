// src/pages/Products.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import ProductForm from "../components/products/ProductForm";
import ProductDetailModal from "../components/products/ProductDetailModal";

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const serverUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

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
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.supplier?.name &&
          p.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    setFiltered(filtered);
  }, [searchTerm, products]);

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
      <div className="sm:flex sm:items-center sm:justify-between">
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

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
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
            <div className="text-center py-12 text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleCardClick(p)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="h-48 bg-gray-200">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={`${serverUrl}/${p.images[0]}`}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-500">{p.category}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        ${p.price?.toFixed(2)}
                      </span>
                      <span
                        className={`text-sm ${p.stockQuantity <= p.threshold ? "text-red-600 font-semibold" : "text-gray-600"}`}
                      >
                        Stock: {p.stockQuantity}
                      </span>
                    </div>
                    {canEdit && (
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={(e) => handleEdit(p, e)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(p._id, p.name, e)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
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
