import api from "./api";

export const paymentService = {
  async processPayment(orderId, paymentMethod = "upi") {
    const res = await api.post("/payments/process", {
      order_id: orderId,
      payment_method: paymentMethod,
    });
    return res.data;
  },

  async getReceipt(orderId) {
    const res = await api.get(`/payments/receipt/${orderId}`);
    return res.data;
  },
};
