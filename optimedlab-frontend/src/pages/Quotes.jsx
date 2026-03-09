// src/pages/Quotes.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import quoteService from "../services/quoteService";
import invoiceService from "../services/invoiceService";
import QuoteForm from "../components/quotes/QuoteForm";
import QuoteDetailsModal from "../components/quotes/QuoteDetailsModal";

const Quotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [detailQuote, setDetailQuote] = useState(null);

  const canEdit = user && user.role === "commercial";
  const canView =
    user && (user.role === "commercial" || user.role === "director");

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await quoteService.getQuotes();
      setQuotes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedQuote(null);
    setShowForm(true);
  };

  const handleEdit = (quote) => {
    setSelectedQuote(quote);
    setShowForm(true);
  };

  const handleDelete = async (id, quoteNumber) => {
    if (
      window.confirm(`Are you sure you want to delete quote #${quoteNumber}?`)
    ) {
      try {
        await quoteService.deleteQuote(id);
        fetchQuotes();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete quote");
      }
    }
  };

  const handleValidate = async (id) => {
    if (
      window.confirm("Validate this quote? It cannot be edited once validated.")
    ) {
      try {
        await quoteService.validateQuote(id);
        fetchQuotes();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to validate quote");
      }
    }
  };

  const handleCreateInvoice = async (quoteId) => {
    if (window.confirm("Create an invoice from this quote?")) {
      try {
        await invoiceService.createInvoiceFromQuote(quoteId);
        alert("Invoice created successfully!");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to create invoice");
      }
    }
  };

  const handleDownloadPDF = async (id, quoteNumber) => {
    try {
      const blob = await quoteService.downloadQuotePDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Quote-${quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to download PDF");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");

  // 👇 BULLETPROOF TOTAL CALCULATOR 👇
  const calculateTotal = (quote) => {
    // If the backend has a valid total > 0, use it
    if (quote.totalAmount && quote.totalAmount > 0) return quote.totalAmount;

    // Otherwise, calculate it dynamically from the items!
    if (!quote.items || quote.items.length === 0) return 0;

    return quote.items.reduce((sum, item) => {
      // Fallback to the product's price if the item's price is missing/0
      const price = item.price || item.product?.price || 0;
      return sum + item.quantity * price;
    }, 0);
  };

  if (!canView) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage client quotes and generate invoices.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Quote
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
                {quotes.map((q) => (
                  <tr
                    key={q._id}
                    onClick={() => setDetailQuote(q)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {q.quoteNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {q.client?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {q.client?.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(q.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {/* 👇 USING THE DYNAMIC CALCULATOR 👇 */}
                      {calculateTotal(q).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          q.status === "validated"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {q.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(q._id, q.quoteNumber);
                        }}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                      >
                        PDF
                      </button>
                      {canEdit && q.status === "draft" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(q);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleValidate(q._id);
                            }}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Validate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(q._id, q.quoteNumber);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {canEdit && q.status === "validated" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateInvoice(q._id);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Create Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No quotes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <QuoteForm
          quote={selectedQuote}
          onSubmit={async (data) => {
            try {
              if (selectedQuote) {
                await quoteService.updateQuote(selectedQuote._id, data);
              } else {
                await quoteService.createQuote(data);
              }
              setShowForm(false);
              fetchQuotes();
            } catch (err) {
              alert(err.response?.data?.message || "Operation failed");
            }
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {detailQuote && (
        <QuoteDetailsModal
          quote={detailQuote}
          onClose={() => setDetailQuote(null)}
        />
      )}
    </div>
  );
};

export default Quotes;
