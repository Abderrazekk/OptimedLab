// src/components/products/ProductDetailModal.jsx
import React from "react";
import { formatPrice } from "../../utils/formatPrice";

const ProductDetailModal = ({ product, onClose }) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Strip '/api' from the end of the URL to get the base server URL
  const serverUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">
            {product.name}
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-2">
                <img
                  src={`${serverUrl}/${product.images[0]}`}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={`${apiUrl}/${img}`}
                        alt={`${product.name} ${idx + 2}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 rounded-lg">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-lg font-medium">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock</p>
              <p
                className={`text-lg ${product.stockQuantity <= product.threshold ? "text-red-600 font-semibold" : ""}`}
              >
                {product.stockQuantity} units
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alert Threshold</p>
              <p className="text-lg">{product.threshold}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="text-lg">{product.supplier?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SKU</p>
              <p className="text-lg">{product.sku || "N/A"}</p>
            </div>
            {product.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
