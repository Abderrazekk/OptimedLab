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

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(supplier);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(supplier._id, supplier.name);
  };

  const handleViewProducts = (e) => {
    e.stopPropagation();
    navigate(`/products?supplierId=${supplier._id}`);
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    onViewDetails(supplier);
  };

  return (
    <div
      onClick={() => onViewDetails(supplier)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
    >
      {/* Hover accent bar */}
      <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-emerald-600 to-emerald-300 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Left brand color indicator (always visible) */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: supplier.bgColor || "#d1d5db" }}
      />

      <div className="flex-1 p-5 pl-6">
        {/* Top row: avatar + name + contact */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-emerald-50 bg-gray-50">
            {supplier.image ? (
              <img
                src={`${BACKEND_URL}${supplier.image}`}
                alt={supplier.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-lg font-bold text-white"
                style={{ backgroundColor: supplier.bgColor || "#9ca3af" }}
              >
                {supplier.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-gray-900">
              {supplier.name}
            </h3>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {supplier.contactPerson || "No contact person"}
            </p>
          </div>
        </div>

        {/* Contact details */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <span className="truncate">{supplier.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.5 7.5l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <span className="truncate">{supplier.phone}</span>
          </div>
        </div>
      </div>

      {/* Actions footer – appears on hover */}
      <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/70 px-5 py-3 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDetails}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
          >
            Details
          </button>
          <button
            onClick={handleViewProducts}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
          >
            <svg
              className="h-3 w-3"
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

        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCard;
