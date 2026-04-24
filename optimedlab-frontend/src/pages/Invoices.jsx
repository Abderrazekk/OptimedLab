import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import invoiceService from "../services/invoiceService";
import InvoiceDetailsModal from "../components/invoices/InvoiceDetailsModal";
import { formatPrice } from "../utils/formatPrice";
import { formatDate, getDaysRemaining, isOverdue } from "../utils/dateHelpers";

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const canEdit = user && user.role === "commercial";
  const canView =
    user &&
    (user.role === "commercial" ||
      user.role === "director" ||
      user.role === "admin");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoices();
      setInvoices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Compute counts for filter badges
  const counts = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return {
      all: invoices.length,
      paid: invoices.filter((inv) => inv.paymentStatus === "paid").length,
      unpaid: invoices.filter((inv) => inv.paymentStatus === "unpaid").length,
      partially: invoices.filter((inv) => inv.paymentStatus === "partially")
        .length,
      overdue: invoices.filter(
        (inv) =>
          inv.paymentStatus === "unpaid" &&
          inv.dueDate &&
          new Date(inv.dueDate) < now,
      ).length,
      dueThisWeek: invoices.filter(
        (inv) =>
          inv.paymentStatus === "unpaid" &&
          inv.dueDate &&
          new Date(inv.dueDate) > now &&
          new Date(inv.dueDate) <= sevenDaysFromNow,
      ).length,
      thisMonth: invoices.filter(
        (inv) => new Date(inv.createdAt) >= startOfMonth,
      ).length,
    };
  }, [invoices]);

  // Memoized filtered invoices (by category filter + text search)
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    let result = invoices;

    // 1. Apply category filter
    switch (filter) {
      case "paid":
        result = result.filter((inv) => inv.paymentStatus === "paid");
        break;
      case "unpaid":
        result = result.filter((inv) => inv.paymentStatus === "unpaid");
        break;
      case "partially":
        result = result.filter((inv) => inv.paymentStatus === "partially");
        break;
      case "overdue":
        result = result.filter(
          (inv) =>
            inv.paymentStatus === "unpaid" &&
            inv.dueDate &&
            new Date(inv.dueDate) < now,
        );
        break;
      case "dueThisWeek":
        result = result.filter(
          (inv) =>
            inv.paymentStatus === "unpaid" &&
            inv.dueDate &&
            new Date(inv.dueDate) > now &&
            new Date(inv.dueDate) <= sevenDaysFromNow,
        );
        break;
      case "thisMonth":
        result = result.filter(
          (inv) => new Date(inv.createdAt) >= startOfMonth,
        );
        break;
      default: // "all"
        break;
    }

    // 2. Apply text search on top
    if (searchTerm) {
      result = result.filter(
        (inv) =>
          inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.client?.company?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return result;
  }, [invoices, filter, searchTerm]);

  const handlePaymentStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
      await invoiceService.updatePaymentStatus(id, newStatus);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update payment status");
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const blob = await invoiceService.downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert("Failed to download PDF");
    }
  };

  const calculateTotal = (inv) => {
    if (inv.total && inv.total > 0) return inv.total;
    if (!inv.items || inv.items.length === 0) return 0;
    return inv.items.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + item.quantity * price;
    }, 0);
  };

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
              Invoice Management
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-white/50">
            View and manage client invoices.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {counts.all}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Paid
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-600">
              {counts.paid}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Unpaid
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-red-600">
              {counts.unpaid}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Overdue
            </div>
            <div
              className={`text-2xl font-bold -tracking-[0.03em] ${counts.overdue > 0 ? "text-red-600" : "text-emerald-900"}`}
            >
              {counts.overdue}
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
              placeholder="Search by invoice number or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500">
            <strong className="text-emerald-900">
              {filteredInvoices.length}
            </strong>
            {filteredInvoices.length === 1 ? "invoice" : "invoices"}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {[
            { key: "all", label: "All", count: counts.all },
            { key: "paid", label: "Paid", count: counts.paid },
            { key: "unpaid", label: "Unpaid", count: counts.unpaid },
            ...(counts.partially > 0
              ? [
                  {
                    key: "partially",
                    label: "Partially Paid",
                    count: counts.partially,
                  },
                ]
              : []),
            { key: "overdue", label: "Overdue", count: counts.overdue },
            {
              key: "dueThisWeek",
              label: "Due This Week",
              count: counts.dueThisWeek,
            },
            { key: "thisMonth", label: "This Month", count: counts.thisMonth },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                filter === tab.key
                  ? "border-emerald-900 bg-emerald-900 text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                  filter === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100"
            >
              Clear Filters
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
            <span className="text-sm text-gray-400">Loading invoices…</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              No invoices found
            </div>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              Try adjusting your filters or search.
            </p>
          </div>
        ) : (
          /* Invoices list */
          <div className="space-y-2">
            {filteredInvoices.map((inv) => {
              const daysLeft = getDaysRemaining(inv.dueDate);
              const overdue = isOverdue(inv.dueDate);
              const paymentColor =
                inv.paymentStatus === "paid"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : inv.paymentStatus === "partially"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-700 border-red-200";

              return (
                <div
                  key={inv._id}
                  onClick={() => setDetailInvoice(inv)}
                  className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-4 rounded-2xl border border-gray-100 bg-white p-4 cursor-pointer transition-all hover:translate-x-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5"
                >
                  {/* Invoice Number */}
                  <div className="md:w-2/12">
                    <span className="text-sm font-bold text-gray-900 truncate">
                      {inv.invoiceNumber}
                    </span>
                  </div>

                  {/* Client */}
                  <div className="md:w-2/12 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {inv.client?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {inv.client?.company}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="md:w-1/12 text-sm text-gray-500">
                    {formatDate(inv.createdAt)}
                  </div>
                  <div className="md:w-1/12 text-sm text-gray-500">
                    {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                  </div>

                  {/* Days Left */}
                  <div className="md:w-1/12 text-sm">
                    {inv.dueDate ? (
                      <span
                        className={
                          daysLeft <= 0
                            ? "text-red-600 font-bold"
                            : "text-gray-700"
                        }
                      >
                        {daysLeft} days
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>

                  {/* Total */}
                  <div className="md:w-1/12 text-sm font-bold text-gray-900">
                    {formatPrice(calculateTotal(inv))}
                  </div>

                  {/* Payment Status */}
                  <div className="md:w-1/12">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${paymentColor}`}
                    >
                      {inv.paymentStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="md:w-3/12 flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(inv._id, inv.invoiceNumber);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      PDF
                    </button>
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentStatusChange(inv._id, inv.paymentStatus);
                        }}
                        disabled={overdue && inv.paymentStatus === "unpaid"}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                          inv.paymentStatus === "paid"
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 12l2 2 4-4" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Mark as{" "}
                        {inv.paymentStatus === "paid" ? "Unpaid" : "Paid"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailInvoice && (
        <InvoiceDetailsModal
          invoice={detailInvoice}
          onClose={() => setDetailInvoice(null)}
        />
      )}
    </div>
  );
};

export default Invoices;
