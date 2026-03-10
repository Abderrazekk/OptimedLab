// src/components/suppliers/SupplierCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const SupplierCard = ({
  supplier,
  BACKEND_URL,
  canEdit,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative">
      {/* Classy Top Accent Line using the chosen color */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: supplier.bgColor || "#d1d5db" }}
      />

      <div className="p-6 flex-1">
        {/* Header: Avatar & Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-gray-50">
              {supplier.image ? (
                <img
                  src={`${BACKEND_URL}${supplier.image}`}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xl font-semibold text-white tracking-wide"
                  style={{ backgroundColor: supplier.bgColor || "#9ca3af" }}
                >
                  {supplier.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3
                className="text-lg font-bold text-gray-900 leading-tight truncate w-40 sm:w-48"
                title={supplier.name}
              >
                {supplier.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-medium flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-1.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {supplier.contactPerson || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-5 w-full"></div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 group/item">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400 group-hover/item:text-gray-900 group-hover/item:bg-gray-100 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="truncate font-medium" title={supplier.email}>
              {supplier.email}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 group/item">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400 group-hover/item:text-gray-900 group-hover/item:bg-gray-100 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <span className="font-medium">{supplier.phone}</span>
          </div>
        </div>
      </div>

      {/* Minimalist Actions Footer */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
        {/* Left Side Actions: Details & View Products */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onViewDetails(supplier)}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
          >
            Details
          </button>

          <button
            onClick={() => navigate(`/products?supplierId=${supplier._id}`)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Products
          </button>
        </div>

        {/* Right Side Actions: Edit & Delete */}
        {canEdit && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(supplier)}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(supplier._id, supplier.name)}
              className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCard;
