// src/components/stock/StockMovementDetails.jsx
import React, { useEffect } from "react";

const StockMovementDetails = ({ movement, onClose }) => {
  // Add this to check what the backend is actually sending!
  useEffect(() => {
    if (movement) {
      console.log("RECEIVED MOVEMENT DATA:", movement);
    }
  }, [movement]);

  if (!movement) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "medium",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl p-6 bg-white border rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Stock Movement Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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

        <div className="space-y-6">
          {/* PRODUCT INFO WITH IMAGE & CORRECT CURRENT STOCK */}
          <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="h-16 w-16 shrink-0 bg-white rounded-lg p-1 border border-gray-200">
              {movement.product?.images &&
              movement.product.images.length > 0 ? (
                <img
                  className="h-full w-full rounded object-cover"
                  src={getImageUrl(movement.product.images[0])}
                  alt={movement.product.name}
                />
              ) : (
                <div className="h-full w-full rounded bg-gray-100 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="ml-4 flex-1">
              <h4 className="text-lg font-bold text-gray-900">
                {movement.product?.name || "Unknown Product"}
              </h4>
              <p className="text-sm text-gray-500">
                SKU: {movement.product?.sku || "N/A"}
              </p>
            </div>

            {/* CURRENT STOCK FIX */}
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Current Stock
              </p>
              <p className="text-xl font-bold text-gray-900">
                {movement.product?.stockQuantity !== undefined
                  ? movement.product.stockQuantity
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* MOVEMENT DATA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Movement Type
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                  movement.type === "in"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {movement.type === "in" ? "Stock In (+)" : "Stock Out (-)"}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Quantity Adjusted
              </p>
              <p className="text-xl font-bold text-gray-900">
                {movement.quantity} units
              </p>
            </div>
          </div>

          {/* METADATA */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Date & Time
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(movement.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Performed By
              </p>
              <p className="text-sm text-gray-900">
                {movement.user?.name || "Unknown User"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Note / Reference
              </p>
              <p className="text-sm text-gray-700 italic">
                {movement.note || movement.reference || "No notes provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockMovementDetails;
