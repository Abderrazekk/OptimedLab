// src/components/quotes/QuoteDetailsModal.jsx
import React from "react";

const QuoteDetailsModal = ({ quote, onClose }) => {
  if (!quote) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");

  // 👇 BULLETPROOF TOTAL CALCULATOR 👇
  const calculateTotal = () => {
    if (quote.totalAmount && quote.totalAmount > 0) return quote.totalAmount;
    if (!quote.items || quote.items.length === 0) return 0;

    return quote.items.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + item.quantity * price;
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Quote #{quote.quoteNumber}
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

        <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Client</p>
            <p className="font-semibold text-gray-900">{quote.client?.name}</p>
            <p className="text-sm text-gray-600">{quote.client?.company}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Details</p>
            <p className="text-sm text-gray-900">
              Date: {formatDate(quote.createdAt)}
            </p>
            <p className="text-sm text-gray-900">
              Status:{" "}
              <span className="uppercase font-bold">{quote.status}</span>
            </p>
          </div>
        </div>

        <h4 className="font-semibold text-lg mb-3">Products</h4>
        <div className="overflow-x-auto border rounded-lg mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.items.map((item, index) => {
                // Determine item price dynamically
                const itemPrice = item.price || item.product?.price || 0;
                const itemTotal = item.quantity * itemPrice;

                return (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.product?.images?.length > 0 ? (
                          <img
                            src={getImageUrl(item.product.images[0])}
                            alt="product"
                            className="h-10 w-10 rounded object-cover mr-3 border"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded mr-3 flex items-center justify-center border">
                            <span className="text-xs text-gray-400">N/A</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.product?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      {itemPrice.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {itemTotal.toFixed(2)} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end text-xl font-bold text-gray-900">
          {/* 👇 USING THE DYNAMIC CALCULATOR 👇 */}
          Total: {calculateTotal().toFixed(2)} €
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailsModal;
