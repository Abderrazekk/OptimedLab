// src/pages/Users.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";
import UserForm from "../components/users/UserForm";

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

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch users
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

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user ${userName}?`)) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      // Refresh list
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleBan = async (userId, userName, isCurrentlyBanned) => {
    const action = isCurrentlyBanned ? "unban" : "ban";
    if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return;
    }

    try {
      await userService.toggleBanUser(userId);
      fetchUsers(); // Refresh the list to show new status
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  // NEW: Handler for toggling Super Commercial status directly from the list
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
    ) {
      return;
    }

    try {
      await userService.toggleSuperCommercial(userId);
      fetchUsers(); // Refresh the list to show new status
    } catch (err) {
      alert(err.response?.data?.message || "Action impossible");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      if (selectedUser) {
        // Update
        await userService.updateUser(selectedUser._id, formData);
      } else {
        // Create
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-10">
      {/* Header Section */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage system users, their roles, and access permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddUser}
            className="inline-flex items-center px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-200/50 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <svg
              className="mr-2 -ml-1 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New User
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center">
          <svg
            className="h-5 w-5 mr-2 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            No users found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating a new user.
          </p>
        </div>
      )}

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div
            key={u._id}
            className={`flex flex-col bg-white rounded-2xl border ${u.isBanned ? "border-red-200 shadow-red-100/50" : "border-slate-200"} shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200`}
          >
            {/* Card Content */}
            <div className="p-6 flex-grow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-lg font-bold border ${u.isBanned ? "bg-red-50 text-red-700 border-red-200" : "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200"}`}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    {" "}
                    {/* min-w-0 allows truncate to work inside flex */}
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {u.name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{u.email}</p>
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${
                    u.role === "admin"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : u.role === "commercial"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : u.role === "stock"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
                >
                  {u.role === "commercial"
                    ? "Technico-Commercial"
                    : u.role === "stock"
                      ? "Responsable Stock"
                      : u.role === "director"
                        ? "Directeur"
                        : "Admin"}
                </span>

                {/* NEW: Super Commercial Badge */}
                {u.role === "commercial" && u.isSuperCommercial && (
                  <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border bg-yellow-50 text-yellow-700 border-yellow-200">
                    👑 Super Commercial
                  </span>
                )}

                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${
                    u.isBanned
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {u.isBanned ? "Banned" : "Active"}
                </span>
              </div>

              {/* Additional Info */}
              <div className="mt-5 text-xs text-slate-500 flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Joined:{" "}
                {new Date(u.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Card Footer (Actions) */}
            <div
              className={`px-6 py-4 border-t flex flex-wrap justify-end gap-4 ${u.isBanned ? "bg-red-50/30 border-red-100" : "bg-slate-50 border-slate-100"}`}
            >
              <button
                onClick={() => handleEditUser(u)}
                className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold transition-colors flex items-center"
              >
                Edit
              </button>

              {/* NEW: Toggle Super Commercial Button */}
              {u.role === "commercial" && !u.isBanned && (
                <button
                  onClick={() =>
                    handleToggleSuperCommercial(
                      u._id,
                      u.name,
                      u.isSuperCommercial,
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                >
                  {u.isSuperCommercial ? "Demote Super" : "Make Super"}
                </button>
              )}

              {u._id !== user?._id && ( // Cannot ban/delete yourself
                <>
                  <button
                    onClick={() => handleToggleBan(u._id, u.name, u.isBanned)}
                    className={`${u.isBanned ? "text-amber-600 hover:text-amber-800" : "text-orange-500 hover:text-orange-700"} text-sm font-semibold transition-colors`}
                  >
                    {u.isBanned ? "Unban" : "Ban"}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u._id, u.name)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
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
