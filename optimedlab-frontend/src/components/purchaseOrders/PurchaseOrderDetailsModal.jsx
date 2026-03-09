// src/components/purchaseOrders/PurchaseOrderDetailsModal.jsx
import React from "react";

const PurchaseOrderDetailsModal = ({ purchaseOrder, onClose }) => {
  if (!purchaseOrder) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Purchase Order #{purchaseOrder.poNumber}
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

        <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Supplier
            </p>
            <p className="font-bold text-gray-900 text-lg">
              {purchaseOrder.supplier?.name || "Unknown"}
            </p>
            {purchaseOrder.supplier?.email && (
              <p className="text-sm text-gray-600">
                {purchaseOrder.supplier.email}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Order Details
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Created:</span>{" "}
              {formatDate(purchaseOrder.createdAt)}
            </p>
            <div className="mt-2">
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  purchaseOrder.status === "received"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {purchaseOrder.status.toUpperCase()}
              </span>
            </div>
            {purchaseOrder.status === "received" &&
              purchaseOrder.receivedAt && (
                <p className="text-sm text-gray-900 mt-2">
                  <span className="font-medium">Received At:</span>{" "}
                  {formatDate(purchaseOrder.receivedAt)}
                </p>
              )}
          </div>
        </div>

        <h4 className="font-bold text-lg mb-3 text-gray-800">
          Products Ordered
        </h4>
        <div className="overflow-x-auto border rounded-lg mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrder.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {item.product?.images?.length > 0 ? (
                        <img
                          src={getImageUrl(item.product.images[0])}
                          alt="product"
                          className="h-10 w-10 rounded object-cover mr-3 border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded mr-3 flex items-center justify-center border border-gray-200">
                          <span className="text-xs text-gray-400">N/A</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {item.product?.name || "Unknown Product"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {item.product?.sku || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">
                    {item.quantity} Units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsModal;
