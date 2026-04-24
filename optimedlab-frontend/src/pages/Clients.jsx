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

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedClientToEdit, setSelectedClientToEdit] = useState(null);
  const [selectedClientToView, setSelectedClientToView] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

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
    e.stopPropagation();
    setSelectedClientToEdit(client);
    setShowForm(true);
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
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

  // Avatar initials gradient palette
  const avatarGradients = [
    "from-emerald-400 to-green-600",
    "from-green-400 to-teal-600",
    "from-teal-400 to-emerald-600",
    "from-green-500 to-emerald-700",
    "from-emerald-300 to-green-500",
  ];
  const getAvatarGradient = (name) =>
    avatarGradients[name.charCodeAt(0) % avatarGradients.length];

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-8 pb-16 pt-10">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15)_0%,transparent_60%)]"></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(5,150,105,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute -right-15 -top-15 h-75 w-75 rounded-full border border-white/5"></div>

        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-emerald-300">
              Client Management
            </span>
          </div>
          <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
            Clients Directory
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage and grow your client network
          </p>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total Clients
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {clients.length}
            </div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.7rem] font-semibold text-emerald-600">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 2L8 5H2L5 2Z" fill="currentColor" />
              </svg>
              Active
            </span>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Showing
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {filteredClients.length}
            </div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.7rem] font-semibold text-emerald-600">
              Filtered
            </span>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              With Company
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {clients.filter((c) => c.company).length}
            </div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.7rem] font-semibold text-emerald-600">
              Corporate
            </span>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Independent
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {clients.filter((c) => !c.company).length}
            </div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.7rem] font-semibold text-emerald-600">
              Freelance
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="px-8 pb-10 pt-6">
        {/* Controls bar */}
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
              placeholder="Search by name, email, or company…"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500">
            <strong className="text-emerald-900">
              {filteredClients.length}
            </strong>
            {filteredClients.length === 1 ? "client" : "clients"}
          </div>

          <div className="flex rounded-xl border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`rounded-lg p-2 transition ${
                viewMode === "grid"
                  ? "bg-emerald-900 text-white"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="currentColor"
                />
                <rect
                  x="9"
                  y="1"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="currentColor"
                />
                <rect
                  x="1"
                  y="9"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="currentColor"
                />
                <rect
                  x="9"
                  y="9"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={`rounded-lg p-2 transition ${
                viewMode === "list"
                  ? "bg-emerald-900 text-white"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="1"
                  y="2"
                  width="14"
                  height="2.5"
                  rx="1.25"
                  fill="currentColor"
                />
                <rect
                  x="1"
                  y="6.75"
                  width="14"
                  height="2.5"
                  rx="1.25"
                  fill="currentColor"
                />
                <rect
                  x="1"
                  y="11.5"
                  width="14"
                  height="2.5"
                  rx="1.25"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {canAddEdit && (
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
              New Client
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
            <span className="text-sm text-gray-400">Loading clients…</span>
          </div>
        ) : filteredClients.length === 0 ? (
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {searchTerm ? "No matching clients" : "No clients yet"}
            </div>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              {searchTerm
                ? `No results for "${searchTerm}". Try a different name, email, or company.`
                : "Add your first client to get started with your network."}
            </p>
            {canAddEdit && !searchTerm && (
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
                Add First Client
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* ── Grid View ──────────────────────────────── */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                onClick={() => handleViewDetails(client)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                {/* Top gradient bar on hover */}
                <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-emerald-600 to-emerald-300 opacity-0 transition-opacity group-hover:opacity-100"></div>

                <div className="flex-1 p-5">
                  <div className="mb-4 flex items-start gap-3">
                    {client.image ? (
                      <img
                        src={`http://localhost:5000/uploads/clients/${client.image}`}
                        alt={client.name}
                        className="h-12 w-12 shrink-0 rounded-xl border-2 border-emerald-50 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${getAvatarGradient(client.name)} text-lg font-bold text-white shadow-sm`}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-sm font-bold text-gray-900"
                        title={client.name}
                      >
                        {client.name}
                      </div>
                      <div
                        className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-full bg-emerald-50 px-2 py-0.5 text-[0.7rem] font-semibold text-emerald-600"
                        title={client.company}
                      >
                        {client.company || "Independent"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 h-px bg-linear-to-r from-emerald-50 via-gray-100 to-emerald-50"></div>

                  <div className="space-y-2.5">
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
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <span className="truncate">{client.email}</span>
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
                      <span className="truncate">{client.phone}</span>
                    </div>
                  </div>
                </div>

                {(canAddEdit || canDelete) && (
                  <div className="flex justify-end gap-1.5 border-t border-gray-50 bg-gray-50/70 px-5 py-3">
                    {canAddEdit && (
                      <button
                        onClick={(e) => handleEdit(e, client)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
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
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) =>
                          handleDelete(e, client._id, client.name)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* ── List View ──────────────────────────────── */
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                onClick={() => handleViewDetails(client)}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:translate-x-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5"
              >
                {client.image ? (
                  <img
                    src={`http://localhost:5000/uploads/clients/${client.image}`}
                    alt={client.name}
                    className="h-10 w-10 shrink-0 rounded-lg border border-emerald-50 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${getAvatarGradient(client.name)} text-base font-bold text-white shadow-sm`}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-gray-900">
                    {client.name}
                  </div>
                  <div className="text-xs font-semibold text-emerald-600">
                    {client.company || "Independent"}
                  </div>
                </div>

                <div className="hidden items-center gap-6 md:flex">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {client.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.5 7.5l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {client.phone}
                  </div>
                </div>

                {(canAddEdit || canDelete) && (
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canAddEdit && (
                      <button
                        onClick={(e) => handleEdit(e, client)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
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
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) =>
                          handleDelete(e, client._id, client.name)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="2"
                  className="shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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
