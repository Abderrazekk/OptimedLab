import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import clientService from "../services/clientService";
import ClientForm from "../components/clients/ClientForm";
import ClientDetailsModal from "../components/clients/ClientDetailsModal";

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Selected client states
  const [selectedClientToEdit, setSelectedClientToEdit] = useState(null);
  const [selectedClientToView, setSelectedClientToView] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Check user role for permissions
  const canAddEdit =
    user && (user.role === "admin" || user.role === "commercial");
  const canDelete = user && user.role === "admin";

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company &&
          client.company.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      setClients(response.data || response);
      setError("");
    } catch (err) {
      setError("Failed to fetch clients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedClientToEdit(null);
    setShowForm(true);
  };

  const handleEdit = (e, client) => {
    e.stopPropagation(); // Prevents opening the details modal when clicking edit
    setSelectedClientToEdit(client);
    setShowForm(true);
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation(); // Prevents opening the details modal when clicking delete
    if (window.confirm(`Are you sure you want to delete client ${name}?`)) {
      try {
        await clientService.deleteClient(id);
        setClients(clients.filter((client) => client._id !== id));
      } catch (err) {
        alert("Failed to delete client");
        console.error(err);
      }
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClientToView(client);
    setShowDetails(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedClientToEdit) {
        await clientService.updateClient(selectedClientToEdit._id, formData);
      } else {
        await clientService.createClient(formData);
      }
      setShowForm(false);
      fetchClients();
    } catch (err) {
      alert("Failed to save client");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Clients Directory
          </h2>
          <p className="text-gray-500 mt-1">
            Manage and view your client network
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-72">
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
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          {canAddEdit && (
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Client
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {filteredClients.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No clients found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new client or adjust your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClients.map((client) => (
                <div
                  key={client._id}
                  onClick={() => handleViewDetails(client)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden group"
                >
                  {/* Card Body */}
                  <div className="p-6 grow">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {client.image ? (
                          <img
                            src={`http://localhost:5000/uploads/clients/${client.image}`}
                            alt={client.name}
                            className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-md group-hover:border-blue-50 transition-colors"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/56?text=NA";
                            }}
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-white shadow-md">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name & Company */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-lg font-bold text-gray-900 truncate"
                          title={client.name}
                        >
                          {client.name}
                        </h3>
                        <p
                          className="text-sm font-medium text-blue-600 truncate"
                          title={client.company}
                        >
                          {client.company || "Independent"}
                        </p>
                      </div>
                    </div>

                    {/* Quick Contact Info */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="shrink-0 mr-3 h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-0 mr-3 h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="truncate">{client.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  {(canAddEdit || canDelete) && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end gap-3">
                      {canAddEdit && (
                        <button
                          onClick={(e) => handleEdit(e, client)}
                          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-blue-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) =>
                            handleDelete(e, client._id, client.name)
                          }
                          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-red-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Forms and Modals */}
      {showForm && (
        <ClientForm
          client={selectedClientToEdit}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {showDetails && (
        <ClientDetailsModal
          client={selectedClientToView}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default Clients;
