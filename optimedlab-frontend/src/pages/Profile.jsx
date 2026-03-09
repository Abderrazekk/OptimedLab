// src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Profile = () => {
  const { user, login } = useAuth(); // login to refresh context after update
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authService.uploadAvatar(avatarFile);
      if (response.success) {
        setMessage({ type: 'success', text: 'Avatar updated successfully' });
        // Update context user
        const updatedUser = { ...user, avatar: response.data.avatar };
        login(updatedUser); // or use a dedicated method to refresh user
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Avatar upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate passwords match
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email
      };
      if (formData.newPassword) {
        dataToSend.currentPassword = formData.currentPassword;
        dataToSend.newPassword = formData.newPassword;
      }

      const response = await authService.updateProfile(dataToSend);
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        {/* Avatar Section */}
        <div className="mb-6 flex items-center space-x-6">
          <div className="shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:5000${avatarPreview}`}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <label className="block">
              <span className="sr-only">Choose avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </label>
            {avatarFile && (
              <button
                onClick={handleAvatarUpload}
                disabled={loading}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Upload Avatar
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <hr className="my-4" />

          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          <p className="text-sm text-gray-500 mb-2">Leave blank to keep current password</p>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;