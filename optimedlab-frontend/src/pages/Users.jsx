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
    <div className="container mx-auto">
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

      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-slate-200 md:rounded-2xl bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {u.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {u.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
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
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="text-emerald-600 hover:text-emerald-900 mr-4 transition-colors"
                        >
                          Edit
                        </button>
                        {u._id !== user?._id && ( // Cannot delete yourself
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !loading && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No users found.
                </div>
              )}
            </div>
          </div>
        </div>
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
