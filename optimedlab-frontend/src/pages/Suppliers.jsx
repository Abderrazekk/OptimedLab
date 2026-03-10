// src/pages/Suppliers.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import supplierService from "../services/supplierService";
import SupplierForm from "../components/suppliers/SupplierForm";
import SupplierCard from "../components/suppliers/SupplierCard"; // <-- Import the new card

// --- DETAILS MODAL COMPONENT ---
const SupplierDetailsModal = ({
  supplier,
  onClose,
  onEdit,
  BACKEND_URL,
  canEdit,
}) => {
  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: supplier.bgColor || "#d1d5db" }}
        ></div>

        {/* Header Area */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-50 flex-shrink-0">
              {supplier.image ? (
                <img
                  src={`${BACKEND_URL}${supplier.image}`}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl font-bold text-white tracking-wide"
                  style={{ backgroundColor: supplier.bgColor || "#9ca3af" }}
                >
                  {supplier.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {supplier.name}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1 flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5 text-gray-400"
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
                {supplier.contactPerson || "No Contact Person Added"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors focus:outline-none"
          >
            <svg
              className="w-5 h-5"
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

        {/* Scrollable Body */}
        <div className="px-8 py-6 overflow-y-auto flex-1 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info Block */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Contact Details
              </h4>

              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
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
                <div>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {supplier.email}
                  </p>
                  <p className="text-xs text-gray-500">Email Address</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
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
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {supplier.phone}
                  </p>
                  <p className="text-xs text-gray-500">Phone Number</p>
                </div>
              </div>

              {supplier.website && (
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <div>
                    <a
                      href={
                        supplier.website.startsWith("http")
                          ? supplier.website
                          : `https://${supplier.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline break-all"
                    >
                      {supplier.website}
                    </a>
                    <p className="text-xs text-gray-500">Website</p>
                  </div>
                </div>
              )}
            </div>

            {/* Address Block */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Location
              </h4>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {supplier.address?.street ? (
                      <>
                        {supplier.address.street} <br />
                        {supplier.address.city && `${supplier.address.city}, `}
                        {supplier.address.state && `${supplier.address.state} `}
                        {supplier.address.zipCode} <br />
                        {supplier.address.country}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">
                        No address provided
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Block */}
            {supplier.notes && (
              <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Notes
                </h4>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {supplier.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 bg-white flex justify-between items-center flex-shrink-0">
          <p className="text-xs text-gray-400">
            Added on {new Date(supplier.createdAt).toLocaleDateString()}
          </p>
          <div className="space-x-3 flex">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
            >
              Close
            </button>
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(supplier);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none shadow-sm"
              >
                Edit Supplier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States for Modals
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const canEdit = user && (user.role === "admin" || user.role === "stock");
  const canView =
    user &&
    (user.role === "admin" ||
      user.role === "stock" ||
      user.role === "director");

  // Adjust this base URL to match your backend port if different
  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contactPerson &&
          s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    setFiltered(filtered);
  }, [searchTerm, suppliers]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getSuppliers();
      setSuppliers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setShowForm(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${name} from your suppliers?`,
      )
    )
      return;
    try {
      await supplierService.deleteSupplier(id);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete supplier");
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedSupplier) {
        await supplierService.updateSupplier(selectedSupplier._id, data);
      } else {
        await supplierService.createSupplier(data);
      }
      setShowForm(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  if (!canView) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center space-x-4 max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Access Denied
            </h3>
            <p className="text-sm text-gray-500">
              You don't have permission to view suppliers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Suppliers
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Manage your vendor network, contact details, and partnership
            information.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
            />
          </div>
          {canEdit && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all flex-shrink-0"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Supplier
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start text-red-800">
          <svg
            className="w-5 h-5 mr-3 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <SupplierCard
              key={s._id}
              supplier={s}
              BACKEND_URL={BACKEND_URL}
              canEdit={canEdit}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={setViewingSupplier}
            />
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-gray-900 text-lg font-semibold">
                No suppliers found
              </h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                We couldn't find anything matching your search. Try adjusting
                your filters or adding a new supplier.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Forms and Modals */}
      {showForm && (
        <SupplierForm
          supplier={selectedSupplier}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* NEW: Supplier Details Modal */}
      <SupplierDetailsModal
        supplier={viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        onEdit={handleEdit}
        BACKEND_URL={BACKEND_URL}
        canEdit={canEdit}
      />
    </div>
  );
};

export default Suppliers;
