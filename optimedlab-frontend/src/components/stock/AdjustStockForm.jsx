// src/components/stock/AdjustStockForm.jsx
import { useState, useEffect } from "react";
import productService from "../../services/productService";

const AdjustStockForm = ({ product, onSubmit, onClose }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    // Automatically set the productId if a product is passed
    productId: product ? product._id : "",
    type: "in",
    quantity: 1,
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only fetch the full list if no specific product was passed
    if (!product) {
      fetchProducts();
    }
  }, [product]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      // If the field is 'quantity', convert the string to a Number. Otherwise, keep it as is.
      [name]: name === "quantity" ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Manual Stock Adjustment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            {/* Show the locked product name if a product was passed, otherwise show select dropdown */}
            {product ? (
              <input
                type="text"
                value={product.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            ) : (
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Current Stock: {p.stockQuantity})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="in"
                  checked={formData.type === "in"}
                  onChange={handleChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Stock In (Add)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="out"
                  checked={formData.type === "out"}
                  onChange={handleChange}
                  className="form-radio text-red-600"
                />
                <span className="ml-2">Stock Out (Remove)</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Reason for adjustment"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockForm;
