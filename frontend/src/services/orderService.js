import api from "./api";

export const orderService = {
  async createOrder(data) {
    const res = await api.post("/orders", data);
    return res.data.order;
  },

  async getQuote(data) {
    const res = await api.post("/orders/quote", data);
    return res.data.price;
  },

  async listUserOrders() {
    const res = await api.get("/orders");
    return res.data.orders;
  },

  async getOrderDetails(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data.order;
  },

  // Admin endpoints
  async listQueue(params = {}) {
    const res = await api.get("/orders/admin/queue", { params });
    return res.data.orders;
  },

  async updateStatus(id, status) {
    const res = await api.put(`/orders/admin/${id}/status`, { status });
    return res.data.order;
  },

  async verifyPickup(code) {
    const res = await api.post("/orders/admin/verify-pickup", { code });
    return res.data;
  },

  async getAdminStats() {
    const res = await api.get("/admin/stats");
    return res.data;
  },
};
