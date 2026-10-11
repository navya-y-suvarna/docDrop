import api from "./api";

export const fileService = {
  async upload(formData, onUploadProgress) {
    const res = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return res.data;
  },

  async listFiles(params = {}) {
    const res = await api.get("/files", { params });
    return res.data.files;
  },

  async getFile(id) {
    const res = await api.get(`/files/${id}`);
    return res.data.file;
  },

  async updateFile(id, data) {
    const res = await api.put(`/files/${id}`, data);
    return res.data.file;
  },

  async deleteFile(id) {
    const res = await api.delete(`/files/${id}`);
    return res.data;
  },

  async getStats() {
    const res = await api.get("/files/stats/summary");
    return res.data.stats;
  },

  getViewUrl(id) {
    return `/api/files/${id}/view`;
  },

  getDownloadUrl(id) {
    return `/api/files/${id}/download`;
  },
};
