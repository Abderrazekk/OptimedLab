// src/components/purchaseOrders/PurchaseOrderForm.jsx
import { useState, useEffect } from "react";
import supplierService from "../../services/supplierService";
import productService from "../../services/productService";

const PurchaseOrderForm = ({ purchaseOrder, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    supplier: "",
    items: [{ product: "", quantity: 1 }],
  });
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchSuppliersAndProducts();
  }, []);

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        supplier: purchaseOrder.supplier?._id || "",
        items: purchaseOrder.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
      });
    }
  }, [purchaseOrder]);

  const fetchSuppliersAndProducts = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        supplierService.getSuppliers(),
        productService.getProducts(),
      ]);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const handleSupplierChange = (e) => {
    setFormData({ ...formData, supplier: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: "", quantity: 1 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = "Supplier is required";
    formData.items.forEach((item, index) => {
      if (!item.product)
        newErrors[`item-${index}-product`] = "Product is required";
      if (!item.quantity || item.quantity <= 0)
        newErrors[`item-${index}-quantity`] = "Valid quantity required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative w-full max-w-2xl bg-white border rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-900">
            {purchaseOrder ? "Edit Purchase Order" : "Create Purchase Order"}
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              value={formData.supplier}
              onChange={handleSupplierChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.supplier ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.supplier && (
              <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-700 text-lg">Products</h4>
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
                // Find the selected product to display its image
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
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors[`item-${index}-product`] ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-32">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors[`item-${index}-quantity`] ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      title="Remove Item"
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

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {purchaseOrder ? "Update PO" : "Create PO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
