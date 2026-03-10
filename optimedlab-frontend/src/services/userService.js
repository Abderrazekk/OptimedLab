// src/services/userService.js
import api from "./api";

const userService = {
  // Get all users
  async getUsers() {
    const response = await api.get("/users");
    return response.data;
  },

  // Create new user
  async createUser(userData) {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Update user
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Toggle user ban status
  async toggleBanUser(id) {
    const response = await api.put(`/users/${id}/ban`);
    return response.data;
  },
};

export default userService;
