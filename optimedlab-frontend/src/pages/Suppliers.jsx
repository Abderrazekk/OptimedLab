import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import supplierService from "../services/supplierService";
import SupplierForm from "../components/suppliers/SupplierForm";
import SupplierCard from "../components/suppliers/SupplierCard";

// --- DETAILS MODAL (redesigned to match ClientDetailsModal) ---
const SupplierDetailsModal = ({
  supplier,
  onClose,
  onEdit,
  BACKEND_URL,
  canEdit,
}) => {
  if (!supplier) return null;

  const hasAddress =
    supplier.address &&
    (supplier.address.street ||
      supplier.address.city ||
      supplier.address.country);

  const avatarGradients = [
    "from-emerald-400 to-green-600",
    "from-green-400 to-teal-600",
    "from-teal-400 to-emerald-600",
    "from-green-500 to-emerald-700",
    "from-emerald-300 to-green-500",
  ];
  const avatarGradient =
    avatarGradients[supplier.name.charCodeAt(0) % avatarGradients.length];

  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center overflow-y-auto bg-emerald-900/45 p-4 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-145 overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(5,150,105,0.08),0_24px_64px_rgba(6,78,59,0.2),0_8px_24px_rgba(0,0,0,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-7 pb-14 pt-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-55 w-55 rounded-full border border-white/5"></div>
          <div className="pointer-events-none absolute -bottom-12 left-[30%] h-40 w-40 rounded-full border border-white/3"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
                Supplier Profile
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/20 hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Avatar + identity pull-up */}
        <div className="relative z-10 mx-7 -mt-9 flex items-end gap-5">
          <div className="shrink-0 rounded-2xl bg-white p-0.5 shadow-lg shadow-emerald-900/20">
            {supplier.image ? (
              <img
                src={`${BACKEND_URL}${supplier.image}`}
                alt={supplier.name}
                className="h-20 w-20 rounded-2xl object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br ${avatarGradient} text-2xl font-bold text-white`}
              >
                {supplier.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <h2 className="truncate text-xl font-bold -tracking-[0.02em] text-gray-900">
              {supplier.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {supplier.contactPerson || "No contact person added"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Contact */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-600">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.5 7.5l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                  Contact
                </span>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 py-2 first:pt-0 last:border-none last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[0.7rem] font-medium text-gray-400">
                    Email
                  </div>
                  <a
                    href={`mailto:${supplier.email}`}
                    className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    {supplier.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 py-2 first:pt-0 last:border-none last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.5 7.5l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[0.7rem] font-medium text-gray-400">
                    Phone
                  </div>
                  <a
                    href={`tel:${supplier.phone}`}
                    className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    {supplier.phone}
                  </a>
                </div>
              </div>

              {supplier.website && (
                <div className="flex items-center gap-3 border-b border-gray-100 py-2 first:pt-0 last:border-none last:pb-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[0.7rem] font-medium text-gray-400">
                      Website
                    </div>
                    <a
                      href={
                        supplier.website.startsWith("http")
                          ? supplier.website
                          : `https://${supplier.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-600">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                  Location
                </span>
              </div>

              <div className="flex items-start gap-3 border-b border-gray-100 py-2 first:pt-0 last:border-none last:pb-0">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="text-[0.7rem] font-medium text-gray-400">
                    Address
                  </div>
                  {hasAddress ? (
                    <div className="text-sm font-medium text-gray-700">
                      {supplier.address.street && (
                        <div>{supplier.address.street}</div>
                      )}
                      {(supplier.address.city ||
                        supplier.address.state ||
                        supplier.address.zipCode) && (
                        <div>
                          {[
                            supplier.address.city,
                            supplier.address.state,
                            supplier.address.zipCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                      {supplier.address.country && (
                        <span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-emerald-600">
                          {supplier.address.country}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm italic text-gray-400">
                      Not provided
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {supplier.notes && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-amber-100 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-200/50 text-amber-600">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-800">
                  Internal Notes
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm font-normal leading-relaxed text-amber-900">
                {supplier.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 px-7 pb-7 sm:flex-row">
          <button
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            Close
          </button>
          {canEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(supplier);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:translate-y-0.5"
            >
              Edit Supplier
            </button>
          )}
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50/80 p-8">
        <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-6 w-6 text-red-500"
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
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-8 pb-16 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15)_0%,transparent_60%)]"></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(5,150,105,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute -right-15 -top-15 h-75 w-75 rounded-full border border-white/5"></div>

        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-emerald-300">
              Supplier Management
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Suppliers
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your vendor network, contact details, and partnerships
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total Suppliers
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {suppliers.length}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Showing
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {filtered.length}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              With Website
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {suppliers.filter((s) => s.website).length}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Has Contact
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {suppliers.filter((s) => s.contactPerson).length}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10 pt-6">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-55 max-w-90 flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500">
            <strong className="text-emerald-900">{filtered.length}</strong>
            {filtered.length === 1 ? "supplier" : "suppliers"}
          </div>

          {canEdit && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:translate-y-0.5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Supplier
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-white p-4">
            <svg
              className="h-5 w-5 shrink-0 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-red-900">
                Something went wrong
              </div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
            <span className="text-sm text-gray-400">Loading suppliers…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-white p-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-600">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {searchTerm ? "No matching suppliers" : "No suppliers yet"}
            </div>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              {searchTerm
                ? "Try adjusting your search."
                : "Add your first supplier to get started."}
            </p>
            {canEdit && !searchTerm && (
              <button
                onClick={handleAdd}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add First Supplier
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        )}
      </div>

      {showForm && (
        <SupplierForm
          supplier={selectedSupplier}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

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
