// src/components/users/UserForm.jsx
import { useState, useEffect } from "react";

const UserForm = ({ user, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "commercial",
  });
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // password field left empty for edit
        role: user.role || "commercial",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    // Password required only for new users
    if (!user && !formData.password)
      newErrors.password = "Password is required";
    else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data: if password is empty and editing, don't send it
    const submitData = { ...formData };
    if (user && !submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">
            {user ? "Edit User" : "Add New User"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {user ? "Password (leave blank to keep unchanged)" : "Password"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              >
                <option value="admin">Admin</option>
                <option value="commercial">Technico-Commercial</option>
                <option value="stock">Responsable Stock</option>
                <option value="director">Directeur</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
