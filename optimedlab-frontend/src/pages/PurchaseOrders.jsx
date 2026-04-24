import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import purchaseOrderService from "../services/purchaseOrderService";
import PurchaseOrderForm from "../components/purchaseOrders/PurchaseOrderForm";
import PurchaseOrderDetailsModal from "../components/purchaseOrders/PurchaseOrderDetailsModal";

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const canEdit = user && (user.role === "admin" || user.role === "stock");
  const canView =
    user &&
    (user.role === "admin" ||
      user.role === "stock" ||
      user.role === "director");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getPurchaseOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedOrder(null);
    setShowForm(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setShowForm(true);
  };

  const handleDelete = async (id, poNumber) => {
    if (window.confirm(`Are you sure you want to delete PO #${poNumber}?`)) {
      try {
        await purchaseOrderService.deletePurchaseOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete PO");
      }
    }
  };

  const handleReceive = async (id) => {
    if (
      window.confirm(
        "Mark this PO as received? This will update stock quantities.",
      )
    ) {
      try {
        await purchaseOrderService.receivePurchaseOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to receive PO");
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedOrder) {
        await purchaseOrderService.updatePurchaseOrder(selectedOrder._id, data);
      } else {
        await purchaseOrderService.createPurchaseOrder(data);
      }
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");

  const filteredOrders = orders.filter(
    (order) =>
      order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const receivedCount = orders.filter((o) => o.status === "received").length;

  if (!canView) return null;

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
              Supplier Orders
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Purchase Orders
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage incoming stock from suppliers.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total Orders
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {orders.length}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Pending
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-amber-600">
              {pendingCount}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Received
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {receivedCount}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Showing
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {filteredOrders.length}
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
              placeholder="Search by PO number, supplier name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500">
            <strong className="text-emerald-900">
              {filteredOrders.length}
            </strong>
            {filteredOrders.length === 1 ? "order" : "orders"}
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
              Create PO
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
            <span className="text-sm text-gray-400">Loading orders…</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty state */
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
                <path d="M9 17v-2a2 2 0 00-2-2h-.59l-2.71-2.71a1 1 0 010-1.41l.3-.3A1 1 0 016.41 8H8v2l3-3-3-3v2H6.41a3 3 0 00-2.12.88l-.3.3a3 3 0 000 4.24l.3.3A3 3 0 006.41 14H7v2a4 4 0 004 4h2a4 4 0 004-4v-2l-3 3 3 3v-2h1.59a3 3 0 002.12-.88l.3-.3a3 3 0 000-4.24l-.3-.3A3 3 0 0017.59 8H16v2l-3-3 3-3v2h1.59a3 3 0 012.12.88l.3.3a3 3 0 010 4.24l-.3.3A3 3 0 0117.59 14H16v2a4 4 0 01-4 4h-2a4 4 0 01-4-4z" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {searchTerm ? "No matching orders" : "No purchase orders yet"}
            </div>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              {searchTerm
                ? "Try adjusting your search."
                : "Create your first purchase order to get started."}
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
                Create First PO
              </button>
            )}
          </div>
        ) : (
          /* Orders list */
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => setDetailOrder(order)}
                className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-4 rounded-2xl border border-gray-100 bg-white p-4 cursor-pointer transition-all hover:translate-x-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5"
              >
                {/* PO Number */}
                <div className="flex items-center gap-3 md:w-2/6 min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {order.poNumber}
                  </span>
                </div>

                {/* Supplier */}
                <div className="md:w-2/6 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {order.supplier?.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {order.supplier?.email}
                  </div>
                </div>

                {/* Date */}
                <div className="md:w-1/6 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </div>

                {/* Status */}
                <div className="md:w-1/6">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      order.status === "received"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {order.status === "received" ? "Received" : "Pending"}
                  </span>
                </div>

                {/* Actions */}
                <div className="md:w-2/6 flex items-center justify-end gap-2">
                  {canEdit && order.status === "pending" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(order);
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReceive(order._id);
                        }}
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
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Receive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order._id, order.poNumber);
                        }}
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
                    </>
                  )}
                  {!canEdit && order.status === "pending" && (
                    <span className="text-xs text-gray-400">View only</span>
                  )}
                  {order.status === "received" && (
                    <span className="text-xs text-gray-400 italic">
                      Received
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PurchaseOrderForm
          purchaseOrder={selectedOrder}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {detailOrder && (
        <PurchaseOrderDetailsModal
          purchaseOrder={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;
