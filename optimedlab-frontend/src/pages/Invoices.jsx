// src/pages/Invoices.jsx
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
  const [filter, setFilter] = useState("all"); // all, paid, unpaid, partially, overdue, dueThisWeek, thisMonth
  const [detailInvoice, setDetailInvoice] = useState(null);

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

  // Memoized filtered invoices based on selected filter
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    switch (filter) {
      case "all":
        return invoices;
      case "paid":
        return invoices.filter((inv) => inv.paymentStatus === "paid");
      case "unpaid":
        return invoices.filter((inv) => inv.paymentStatus === "unpaid");
      case "partially":
        return invoices.filter((inv) => inv.paymentStatus === "partially");
      case "overdue":
        return invoices.filter(
          (inv) =>
            inv.paymentStatus === "unpaid" &&
            inv.dueDate &&
            new Date(inv.dueDate) < now,
        );
      case "dueThisWeek":
        return invoices.filter(
          (inv) =>
            inv.paymentStatus === "unpaid" &&
            inv.dueDate &&
            new Date(inv.dueDate) > now &&
            new Date(inv.dueDate) <= sevenDaysFromNow,
        );
      case "thisMonth":
        return invoices.filter(
          (inv) => new Date(inv.createdAt) >= startOfMonth,
        );
      default:
        return invoices;
    }
  }, [invoices, filter]);

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

  // Counts for filter badges
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

  if (!canView) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage client invoices.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          All
          <span className="ml-1 text-xs opacity-75">({counts.all})</span>
        </button>
        <button
          onClick={() => setFilter("paid")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 ${
            filter === "paid"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          Paid
          <span className="ml-1 text-xs opacity-75">({counts.paid})</span>
        </button>
        <button
          onClick={() => setFilter("unpaid")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 ${
            filter === "unpaid"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          Unpaid
          <span className="ml-1 text-xs opacity-75">({counts.unpaid})</span>
        </button>
        {counts.partially > 0 && (
          <button
            onClick={() => setFilter("partially")}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 ${
              filter === "partially"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Partially Paid
            <span className="ml-1 text-xs opacity-75">
              ({counts.partially})
            </span>
          </button>
        )}
        <button
          onClick={() => setFilter("overdue")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 ${
            filter === "overdue"
              ? "bg-orange-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          Overdue
          <span className="ml-1 text-xs opacity-75">({counts.overdue})</span>
        </button>
        <button
          onClick={() => setFilter("dueThisWeek")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 ${
            filter === "dueThisWeek"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          Due This Week
          <span className="ml-1 text-xs opacity-75">
            ({counts.dueThisWeek})
          </span>
        </button>
        <button
          onClick={() => setFilter("thisMonth")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 ${
            filter === "thisMonth"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          This Month
          <span className="ml-1 text-xs opacity-75">({counts.thisMonth})</span>
        </button>
        {filter !== "all" && (
          <button
            onClick={() => setFilter("all")}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 border hover:bg-gray-200"
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((inv) => {
                  const daysLeft = getDaysRemaining(inv.dueDate);
                  const overdue = isOverdue(inv.dueDate);
                  return (
                    <tr
                      key={inv._id}
                      onClick={() => setDetailInvoice(inv)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {inv.client?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inv.client?.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatPrice(calculateTotal(inv))}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                            inv.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : inv.paymentStatus === "unpaid"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {inv.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(inv._id, inv.invoiceNumber);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4 font-bold"
                        >
                          PDF
                        </button>
                        {canEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePaymentStatusChange(
                                inv._id,
                                inv.paymentStatus,
                              );
                            }}
                            disabled={overdue && inv.paymentStatus === "unpaid"}
                            className={`${
                              inv.paymentStatus === "paid"
                                ? "text-orange-600 hover:text-orange-900"
                                : "text-green-600 hover:text-green-900"
                            } font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Mark as{" "}
                            {inv.paymentStatus === "paid" ? "Unpaid" : "Paid"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
