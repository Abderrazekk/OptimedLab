// src/components/quotes/QuoteForm.jsx
import { useState, useEffect } from "react";
import clientService from "../../services/clientService";
import productService from "../../services/productService";
import { formatPrice } from "../../utils/formatPrice";

const QuoteForm = ({ quote, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    client: "",
    items: [{ product: "", quantity: 1, price: 0 }],
  });
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClientsAndProducts();
  }, []);

  useEffect(() => {
    if (quote) {
      setFormData({
        client: quote.client?._id || "",
        items: quote.items.map((item) => ({
          product: item.product?._id || item.product,
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
      });
    }
  }, [quote]);

  const fetchClientsAndProducts = async () => {
    try {
      setLoading(true);
      const [clientsRes, productsRes] = await Promise.all([
        clientService.getClients(),
        productService.getProducts(),
      ]);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to load clients or products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (e) => {
    setFormData({ ...formData, client: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-fill the price if a product is selected
    if (field === "product") {
      const selectedProd = products.find((p) => p._id === value);
      if (selectedProd) {
        newItems[index].price = selectedProd.price || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return total + qty * price;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 👇 CRITICAL FIX: Add totalAmount to the payload before submitting 👇
    const finalData = {
      ...formData,
      totalAmount: calculateTotal(),
    };
    onSubmit(finalData);
  };

  // HELPER TO LOAD IMAGES
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-900">
            {quote ? "Edit Quote" : "Create New Quote"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
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
          {/* Client Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Client
            </label>
            <select
              value={formData.client}
              onChange={handleClientChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choose a Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          {/* Items Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-bold text-gray-700">Quote Items</h4>
              <button
                type="button"
                onClick={addItem}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 font-medium transition-colors"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {formData.items.map((item, index) => {
                const selectedProduct = products.find(
                  (p) => p._id === item.product,
                );

                return (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    {/* Thumbnail Image Display */}
                    <div className="shrink-0 h-10 w-10">
                      {selectedProduct?.images?.length > 0 ? (
                        <img
                          src={getImageUrl(selectedProduct.images[0])}
                          alt={selectedProduct.name}
                          className="h-10 w-10 rounded object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="grow">
                      <select
                        value={item.product}
                        onChange={(e) =>
                          handleItemChange(index, "product", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Product...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        required
                        placeholder="Qty"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-32">
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        placeholder="Price"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      title="Remove item"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border text-right">
            <span className="text-xl font-bold text-gray-900">
              Total Amount: {formatPrice(calculateTotal())}
            </span>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {quote ? "Update Quote" : "Create Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
