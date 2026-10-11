import api from "./api";

export const authService = {
  async register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  },

  async login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data.user;
  },

  async updateProfile(name) {
    const res = await api.put("/auth/profile", { name });
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
