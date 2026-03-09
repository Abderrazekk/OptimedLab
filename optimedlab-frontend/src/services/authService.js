import api from "./api";

const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  async getProfile() {
    const response = await api.get("/auth/profile");
    return response.data;
  },
  async updateProfile(userData) {
    const response = await api.put("/auth/profile", userData);
    if (response.data.success) {
      // Update stored user data
      const currentUser = this.getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    return response.data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.success) {
      // Update avatar in stored user
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        currentUser.avatar = response.data.data.avatar;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    }
    return response.data;
  },
};

export default authService;
