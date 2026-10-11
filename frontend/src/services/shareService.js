import api from "./api";

export const shareService = {
  async createShare(fileId, options) {
    const res = await api.post(`/files/${fileId}/share`, options);
    return res.data.share;
  },

  async getFileShares(fileId) {
    const res = await api.get(`/files/${fileId}/shares`);
    return res.data.shares;
  },

  async listUserShares() {
    const res = await api.get("/shares/my-shares");
    return res.data.shares;
  },

  async revokeShare(token) {
    const res = await api.delete(`/shares/${token}`);
    return res.data;
  },

  async deleteShare(id) {
    const res = await api.delete(`/shares/by-id/${id}`);
    return res.data;
  },

  async getPublicShare(token) {
    const res = await api.get(`/shares/public/${token}`);
    return res.data;
  },

  async verifyPublicPassword(token, password) {
    const res = await api.post(`/shares/public/${token}/verify`, { password });
    return res.data;
  },

  getPublicViewUrl(token, passToken = "") {
    return `/api/shares/public/${token}/view${passToken ? `?pass_token=${passToken}` : ""}`;
  },

  getPublicDownloadUrl(token, passToken = "") {
    return `/api/shares/public/${token}/download${passToken ? `?pass_token=${passToken}` : ""}`;
  },
};
