// src/components/products/ProductDetailModal.jsx
import React from "react";
import { formatPrice } from "../../utils/formatPrice";

const ProductDetailModal = ({ product, onClose }) => {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const serverUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

  // <-- NEW: Helper to format location
  const hasLocation = product.shelfLocation && product.shelfLocation.aisle;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="relative p-6 border w-full max-w-2xl shadow-2xl rounded-xl bg-white">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
            <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 rounded-full p-2"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="flex justify-center items-start">
            {product.images && product.images.length > 0 ? (
              <img
                src={`${serverUrl}/${product.images[0].replace(/^\//, "")}`}
                alt={product.name}
                className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {/* <-- NEW: Storage Location Badge --> */}
            {hasLocation ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start">
                <div className="bg-indigo-600 rounded p-2 text-white mr-3 shadow-sm">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Storage Location
                  </p>
                  <p className="text-lg font-bold text-indigo-900">
                    Aisle {product.shelfLocation.aisle} • Shelf{" "}
                    {product.shelfLocation.shelfNumber} • Bin{" "}
                    {product.shelfLocation.binCode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm italic">
                No physical location assigned.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Current Stock
                </p>
                <p
                  className={`text-xl font-bold ${product.stockQuantity <= product.threshold ? "text-red-600" : "text-green-600"}`}
                >
                  {product.stockQuantity} Units
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Price
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Alert Threshold
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {product.threshold} Units
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  SKU / Ref
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {product.sku || "N/A"}
                </p>
              </div>
            </div>

            {product.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700 bg-white border rounded p-3">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
