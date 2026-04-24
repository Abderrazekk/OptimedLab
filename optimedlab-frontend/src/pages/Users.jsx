import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";
import UserForm from "../components/users/UserForm";

const ROLE_CONFIG = {
  admin: { label: "Admin", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  commercial: {
    label: "Technico-Commercial",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  stock: {
    label: "Responsable Stock",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  director: {
    label: "Directeur",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
};

const Users = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [formLoading, setFormLoading] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };
  const handleEditUser = (u) => {
    setSelectedUser(u);
    setShowForm(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user ${userName}?`))
      return;
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleBan = async (userId, userName, isCurrentlyBanned) => {
    const action = isCurrentlyBanned ? "unban" : "ban";
    if (!window.confirm(`Are you sure you want to ${action} ${userName}?`))
      return;
    try {
      await userService.toggleBanUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleToggleSuperCommercial = async (
    userId,
    userName,
    isCurrentlySuper,
  ) => {
    const action = isCurrentlySuper
      ? "retirer le statut de"
      : "promouvoir comme";
    if (
      !window.confirm(
        `Voulez-vous vraiment ${action} Super Commercial pour ${userName}?`,
      )
    )
      return;
    try {
      await userService.toggleSuperCommercial(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Action impossible");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      if (selectedUser) {
        await userService.updateUser(selectedUser._id, formData);
      } else {
        await userService.createUser(formData);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUsers =
    filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const avatarColors = [
    ["#064e3b", "#059669"],
    ["#065f46", "#34d399"],
    ["#047857", "#6ee7b7"],
    ["#065f46", "#059669"],
  ];
  const getAvatarGrad = (name) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-8 pb-16 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(16,185,129,0.15)_0%,transparent_60%)]"></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(5,150,105,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute -right-15 -top-15 h-70 w-70 rounded-full border border-white/5"></div>

        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-emerald-300">
              Administration
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            User Management
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            Manage system users, roles, and access permissions
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-5 py-4">
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total Users
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-900">
              {users.length}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Registered accounts
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-5 py-4">
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Active
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-900">
              {users.filter((u) => !u.isBanned).length}
            </div>
            <div className="mt-1 text-xs text-gray-500">Can log in</div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-5 py-4">
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Commercial
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-900">
              {roleCounts.commercial || 0}
            </div>
            <div className="mt-1 text-xs text-gray-500">Sales team</div>
          </div>
          <div className="flex-1 px-5 py-4">
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Banned
            </div>
            <div
              className="text-2xl font-bold tracking-tight"
              style={{
                color:
                  users.filter((u) => u.isBanned).length > 0
                    ? "#dc2626"
                    : "#064e3b",
              }}
            >
              {users.filter((u) => u.isBanned).length}
            </div>
            <div className="mt-1 text-xs text-gray-500">Access revoked</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10 pt-6">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap gap-1.5">
            {[
              { key: "all", label: "All Users", count: users.length },
              { key: "admin", label: "Admin", count: roleCounts.admin || 0 },
              {
                key: "commercial",
                label: "Commercial",
                count: roleCounts.commercial || 0,
              },
              { key: "stock", label: "Stock", count: roleCounts.stock || 0 },
              {
                key: "director",
                label: "Director",
                count: roleCounts.director || 0,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterRole(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                  filterRole === tab.key
                    ? "border-emerald-900 bg-emerald-900 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                    filterRole === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:translate-y-0.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add User
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-white p-4 text-sm font-medium text-red-900">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
            <span className="text-sm text-gray-400">Loading users…</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-70 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-white p-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-600">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {filterRole === "all" ? "No users yet" : `No ${filterRole} users`}
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {filterRole === "all"
                ? "Add the first user to get started."
                : "Try a different role filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((u) => {
              const role = ROLE_CONFIG[u.role] || ROLE_CONFIG.admin;
              const [gradFrom, gradTo] = getAvatarGrad(u.name);
              const isSelf = u._id === user?._id;

              return (
                <div
                  key={u._id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    u.isBanned
                      ? "border-red-200"
                      : "border-gray-100 hover:border-emerald-200"
                  }`}
                >
                  {/* Top accent bar */}
                  <div
                    className={`absolute inset-x-0 top-0 h-0.75 opacity-0 transition-opacity group-hover:opacity-100 ${
                      u.isBanned
                        ? "bg-linear-to-r from-red-500 to-red-300"
                        : "bg-linear-to-r from-emerald-600 to-emerald-300"
                    }`}
                  ></div>

                  <div className="flex-1 p-5">
                    {/* Avatar + name + status */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-gray-900">
                            {u.name}
                          </div>
                          <div className="truncate text-xs text-gray-400">
                            {u.email}
                          </div>
                        </div>
                      </div>
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.8)]"
                        style={{
                          backgroundColor: u.isBanned ? "#ef4444" : "#059669",
                        }}
                        title={u.isBanned ? "Banned" : "Active"}
                      ></span>
                    </div>

                    <div className="mb-4 h-px bg-linear-to-r from-emerald-50 via-gray-100 to-emerald-50"></div>

                    {/* Badges */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {/* Role */}
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide"
                        style={{
                          color: role.color,
                          backgroundColor: role.bg,
                          border: `1px solid ${role.border}`,
                        }}
                      >
                        {role.label}
                      </span>

                      {/* Super Commercial */}
                      {u.role === "commercial" && u.isSuperCommercial && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[0.65rem] font-bold text-amber-800">
                          ★ Super Commercial
                        </span>
                      )}

                      {/* Active/Banned */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${
                          u.isBanned
                            ? "border border-red-200 bg-red-50 text-red-700"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {u.isBanned ? "Banned" : "Active"}
                      </span>

                      {/* Self */}
                      {isSelf && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[0.65rem] font-bold text-sky-600">
                          You
                        </span>
                      )}
                    </div>

                    {/* Joined */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Joined{" "}
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div
                    className={`flex items-center justify-end gap-1.5 border-t px-5 py-3 ${
                      u.isBanned
                        ? "border-red-100 bg-red-50/70"
                        : "border-gray-50 bg-gray-50/70"
                    }`}
                  >
                    {/* Edit */}
                    <button
                      onClick={() => handleEditUser(u)}
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

                    {/* Super Commercial toggle */}
                    {u.role === "commercial" && !u.isBanned && (
                      <button
                        onClick={() =>
                          handleToggleSuperCommercial(
                            u._id,
                            u.name,
                            u.isSuperCommercial,
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {u.isSuperCommercial ? "Demote" : "Make Super"}
                      </button>
                    )}

                    {/* Ban / Unban + Delete (not for self) */}
                    {!isSelf && (
                      <>
                        <button
                          onClick={() =>
                            handleToggleBan(u._id, u.name, u.isBanned)
                          }
                          className={`inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold transition ${
                            u.isBanned
                              ? "border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                              : "border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                        >
                          {u.isBanned ? (
                            <>
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
                              Unban
                            </>
                          ) : (
                            <>
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line
                                  x1="4.93"
                                  y1="4.93"
                                  x2="19.07"
                                  y2="19.07"
                                />
                              </svg>
                              Ban
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Users;
